// Obtém configurações do script ou da variável global
let config = (window as any).WebChatTupitecConfig || {};
const scriptTag = document.currentScript as HTMLScriptElement | null;

if (scriptTag) {
  config = {
    ...config,
    cor: scriptTag.getAttribute('data-cor') || config.cor || '#007bff',
    posicao: scriptTag.getAttribute('data-posicao') || config.posicao || 'bottom-right',
    icone: scriptTag.getAttribute('data-icone') || config.icone || '💬',
    dominio: scriptTag.getAttribute('data-dominio') || config.dominio || window.location.hostname,
    empresaId: scriptTag.getAttribute('data-empresaid') || config.empresaId || '',
  };
} else {
  config = {
    cor: config.cor || '#007bff',
    posicao: config.posicao || 'bottom-right',
    icone: config.icone || '💬',
    dominio: config.dominio || window.location.hostname,
    empresaId: config.empresaId || '',
  };
}

// Cria botão flutuante
const botao = document.createElement('button');
botao.innerText = config.icone;
botao.style.position = 'fixed';
botao.style.bottom = config.posicao.includes('bottom') ? '20px' : 'unset';
botao.style.top = config.posicao.includes('top') ? '20px' : 'unset';
botao.style.right = config.posicao.includes('right') ? '20px' : 'unset';
botao.style.left = config.posicao.includes('left') ? '20px' : 'unset';
botao.style.backgroundColor = config.cor;
botao.style.color = '#fff';
botao.style.border = 'none';
botao.style.borderRadius = '50%';
botao.style.width = '56px';
botao.style.height = '56px';
botao.style.fontSize = '24px';
botao.style.cursor = 'pointer';
botao.style.zIndex = '9999';
document.body.appendChild(botao);

// Cria iframe (apenas uma vez) e controla visibilidade
const iframe = document.createElement('iframe');
iframe.src = `https://webchat-embed.vercel.app/?dominio=${config.dominio}&empresaId=${config.empresaId}`;
iframe.style.position = 'fixed';
iframe.style.bottom = config.posicao.includes('bottom') ? '80px' : 'unset';
iframe.style.top = config.posicao.includes('top') ? '80px' : 'unset';
iframe.style.right = config.posicao.includes('right') ? '20px' : 'unset';
iframe.style.left = config.posicao.includes('left') ? '20px' : 'unset';
iframe.style.width = '350px';
iframe.style.height = '500px';
iframe.style.border = 'none';
iframe.style.zIndex = '9999';
iframe.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.3)';
iframe.style.display = 'none';
document.body.appendChild(iframe);

// Alterna visibilidade ao clicar no botão
botao.addEventListener('click', () => {
  const visivel = iframe.style.display === 'block';
  iframe.style.display = visivel ? 'none' : 'block';
});
