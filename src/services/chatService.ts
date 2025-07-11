import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // necessário para funcionar no front-end
});

// Envia a mensagem para a IA com logging de tempo e tratamento de erro
export async function enviarMensagemParaIA({
  promptSistema,
  mensagens,
}: {
  promptSistema: string;
  mensagens: { role: 'user' | 'assistant' | 'system'; content: string }[];
}): Promise<string> {
  const inicio = Date.now();

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o', // ou 'gpt-3.5-turbo' para reduzir custo
      messages: [
        { role: 'system', content: promptSistema },
        ...mensagens,
      ],
      temperature: 0.7,
    });

    const resposta = chat.choices[0]?.message?.content || '';
    console.log(`🧠 Resposta da IA recebida em ${Date.now() - inicio}ms`);
    return resposta;
  } catch (erro) {
    console.error('❌ Erro ao conversar com a IA:', erro);
    return 'Desculpe, algo deu errado. Tente novamente mais tarde.';
  }
}

// Gera um resumo da conversa para humanos
export async function gerarResumoDaConversa(
  mensagens: { autor: 'cliente' | 'ia'; texto: string }[]
): Promise<string> {
  const conteudo = mensagens.map((msg) => {
    const prefixo = msg.autor === 'cliente' ? 'Cliente' : 'Atendente';
    return `${prefixo}: ${msg.texto}`;
  }).join('\n');

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Resuma a conversa de forma clara e objetiva, em poucas linhas. Foque nos principais pontos, dúvidas ou solicitações do cliente.',
        },
        {
          role: 'user',
          content: conteudo,
        },
      ],
      temperature: 0.5,
    });

    return chat.choices[0]?.message?.content || 'Resumo indisponível.';
  } catch (erro) {
    console.error('❌ Erro ao gerar resumo:', erro);
    return 'Resumo indisponível.';
  }
}
