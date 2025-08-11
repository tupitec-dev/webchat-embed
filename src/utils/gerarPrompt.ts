// src/utils/gerarPrompt.ts
import type { Atendente, Empresa } from '../types';

type InformacoesEmpresa = Record<string, string>;

interface GerarPromptParams {
  atendente: Atendente;
  empresa: Empresa;
  informacoes: InformacoesEmpresa;
}

// --- helpers de normalização ---
function pickValue(infos: InformacoesEmpresa, keys: string[]): string | undefined {
  for (const k of keys) {
    const raw = infos[k];
    if (raw && raw.trim()) {
      // se vier no formato "valor - descricao", pegamos só o valor antes do primeiro " - "
      const onlyValue = raw.split(' - ')[0].trim();
      if (onlyValue) return onlyValue;
    }
  }
  return undefined;
}

function normalizeSite(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^www\./i.test(url)) return `https://${url}`;
  // se for algo tipo "dominio.com"
  if (/^[^\s]+\.[^\s]+$/i.test(url)) return `https://${url}`;
  return undefined;
}

function normalizeEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const ok = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim());
  return ok ? email.trim() : undefined;
}

function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  // aceita 10 ou 11 dígitos BR; se vier sem DDI, o front ainda linkifica
  return digits;
}

function toWaMe(digits?: string): string | undefined {
  if (!digits) return undefined;
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function gerarPromptPersonalizado({
  atendente,
  empresa,
  informacoes,
}: GerarPromptParams): string {
  // descrição livre
  const descricao = pickValue(informacoes, ['descricao']) || '';

  // contatos (valores canônicos)
  const siteUrl =
    normalizeSite(pickValue(informacoes, ['site', 'website'])) || undefined;

  const emailAddress =
    normalizeEmail(pickValue(informacoes, ['email', 'e-mail'])) || undefined;

  // telefone “cru” (apenas dígitos)
  const phoneDigits =
    normalizePhone(pickValue(informacoes, ['telefone', 'telefoneFixo', 'celular'])) ||
    undefined;

  // WhatsApp: só se houver `whatsapp` (número) ou `whatsappLink`
  const whatsappDigits = normalizePhone(pickValue(informacoes, ['whatsapp'])) || undefined;
  const whatsappLink =
    pickValue(informacoes, ['whatsappLink']) || toWaMe(whatsappDigits) || undefined;

  // bloco de contatos (texto puro, sem HTML/Markdown)
  const contatos: string[] = [];
  if (siteUrl) contatos.push(`- Site: ${siteUrl}`);
  if (emailAddress) contatos.push(`- E-mail: ${emailAddress}`);
  if (phoneDigits) contatos.push(`- Telefone: ${phoneDigits}`);
  if (whatsappLink) contatos.push(`- WhatsApp: ${whatsappLink}`);

  // montar "Outros dados" sem duplicar chaves de contato
  const chavesContato = new Set([
    'descricao',
    'site',
    'website',
    'email',
    'e-mail',
    'telefone',
    'telefoneFixo',
    'celular',
    'whatsapp',
    'whatsappLink',
  ]);

  const outrosDados = Object.entries(informacoes)
    .filter(([chave]) => !chavesContato.has(chave))
    .map(([chave, valor]) => {
      const onlyValue = (valor || '').split(' - ')[0].trim();
      const display = onlyValue || valor || '';
      return `- ${chave}: ${display}`;
    })
    .join('\n');

  // prompt final (IA deve citar contatos em texto puro; front faz a linkificação)
  return `
Você é ${atendente.nome}, um atendente virtual da empresa ${empresa.nome}, reconhecida por oferecer atendimento humanizado, prestativo e cordial.

Seu estilo de atendimento é:
- ${atendente.estilo_personalidade}

Use este tom de voz ao conversar com os clientes:
- ${atendente.dialeto}

Diretrizes de atendimento:
- Responda como um humano real: com empatia, naturalidade e bom senso.
- Evite iniciar cada resposta com saudações (“Oi”, “Olá”, “Boa tarde” etc). Use apenas quando fizer sentido na conversa.
- Use expressões regionais com moderação e apenas quando soarem naturais — nunca force ou exagere.
- Evite parecer robótico, repetitivo ou excessivamente animado.
- Seja objetivo, simpático e direto ao ponto.
- Use seu nome (${atendente.nome}) no final de uma mensagem apenas se for uma despedida ou saudação final.
- Se o cliente pedir para falar com um atendente humano, informe com gentileza que ele será redirecionado e prepare um resumo da conversa para o atendente humano.
- Quando precisar informar contatos (site, e-mail, telefone, WhatsApp), escreva o endereço como texto puro, sem HTML ou Markdown, exatamente como fornecido abaixo. O sistema transforma automaticamente em links.

${contatos.length > 0 ? `Contatos oficiais:\n${contatos.join('\n')}` : 'Contatos oficiais: não informados'}

Informações da empresa:
${descricao ? `\n${descricao}\n` : '\nNenhuma descrição disponível\n'}

Outros dados relevantes:
${outrosDados || '- Nenhuma informação adicional disponível'}

Com base nessas informações e no contexto da conversa, responda à próxima mensagem de forma natural, simpática e eficiente.
`.trim();
}
