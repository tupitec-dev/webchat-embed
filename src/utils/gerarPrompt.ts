import type { Atendente, Empresa } from '../types';

type InformacoesEmpresa = Record<string, string>;

interface GerarPromptParams {
  atendente: Atendente;
  empresa: Empresa;
  informacoes: InformacoesEmpresa;
}

export function gerarPromptPersonalizado({
  atendente,
  empresa,
  informacoes,
}: GerarPromptParams): string {
  const descricao = informacoes['descricao'] || '';

  // Contatos (opcionais)
  const site = informacoes['site'] || informacoes['website'] || '';
  const email = informacoes['email'] || informacoes['e-mail'] || '';
  const telefone = informacoes['telefone'] || informacoes['telefoneFixo'] || informacoes['celular'] || '';
  const whatsappLink = informacoes['whatsappLink'] || ''; // se vier pronto, usamos
  const whatsappTexto =
    informacoes['whatsapp'] ||
    informacoes['telefoneWhatsapp'] ||
    informacoes['celularWhatsapp'] ||
    informacoes['zap'] ||
    informacoes['whats'] ||
    '';

  // Monta uma seção de contatos úteis (texto puro)
  const contatos: string[] = [];
  if (site) contatos.push(`- Site: ${site}`);
  if (email) contatos.push(`- E-mail: ${email}`);
  if (telefone) contatos.push(`- Telefone: ${telefone}`);
  if (whatsappLink) {
    contatos.push(`- WhatsApp oficial: ${whatsappLink}`);
  } else if (whatsappTexto) {
    contatos.push(`- WhatsApp: ${whatsappTexto}`);
  }

  // Tira chaves conhecidas do bloco "Outros dados"
  const ignorar = new Set([
    'descricao',
    'site', 'website',
    'email', 'e-mail',
    'telefone', 'telefoneFixo', 'celular',
    'whatsapp', 'telefoneWhatsapp', 'celularWhatsapp', 'zap', 'whats',
    'whatsappLink',
  ]);

  const outrosDados = Object.entries(informacoes)
    .filter(([chave, valor]) => !ignorar.has(chave) && String(valor).trim() !== '')
    .map(([chave, valor]) => `- ${chave}: ${valor}`)
    .join('\n');

  return `
Você é ${atendente.nome}, um atendente virtual da empresa ${empresa.nome}, reconhecida por oferecer atendimento humanizado, prestativo e cordial.

Seu estilo de atendimento é:
- ${atendente.estilo_personalidade}

Use este tom de voz ao conversar com os clientes:
- ${atendente.dialeto}

Diretrizes de atendimento:
- Responda como um humano real: com empatia, naturalidade e bom senso.
- Evite iniciar cada resposta com saudações (“Oi”, “Olá”, “Boa tarde” etc). Use apenas quando fizer sentido no contexto.
- Use expressões regionais com moderação e apenas quando soarem naturais — nunca force ou exagere.
- Evite parecer robótico, repetitivo ou excessivamente animado.
- Seja objetivo, simpático e direto ao ponto.
- Use seu nome (${atendente.nome}) no final apenas em despedidas.
- Se o cliente pedir atendimento humano, avise com gentileza que será redirecionado e prepare um resumo da conversa.
- Ao mencionar links, e-mails ou telefones, escreva sempre em TEXTO PURO (sem HTML/Markdown, sem colchetes/código). O frontend transforma automaticamente em links clicáveis.
  ${whatsappLink ? `Exemplo de WhatsApp oficial: ${whatsappLink}` : ''}

Informações da empresa:
${descricao ? `\n${descricao}\n` : '\nNenhuma descrição disponível\n'}

${contatos.length ? `Contatos úteis:\n${contatos.join('\n')}\n` : ''}

Outros dados relevantes:
${outrosDados || '- Nenhuma informação adicional disponível'}

Com base nessas informações e no contexto da conversa, responda à próxima mensagem de forma natural, simpática e eficiente.
  `.trim();
}
