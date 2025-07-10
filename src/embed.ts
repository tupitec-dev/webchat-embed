(() => {
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
  const botaoChat = document.createElement('button');
  botaoChat.innerText = config.icone;
  botaoChat.style.position = 'fixed';
  botaoChat.style.bottom = config.posicao.includes('bottom') ? '20px' : 'unset';
  botaoChat.style.top = config.posicao.includes('top') ? '20px' : 'unset';
  botaoChat.style.right = config.posicao.includes('right') ? '20px' : 'unset';
  botaoChat.style.left = config.posicao.includes('left') ? '20px' : 'unset';
  botaoChat.style.backgroundColor = config.cor;
  botaoChat.style.color = '#fff';
  botaoChat.style.border = 'none';
  botaoChat.style.borderRadius = '50%';
  botaoChat.style.width = '56px';
  botaoChat.style.height = '56px';
  botaoChat.style.fontSize = '24px';
  botaoChat.style.cursor = 'pointer';
  botaoChat.style.zIndex = '9999';
  document.body.appendChild(botaoChat);

  // Cria iframe oculto
  const iframeChat = document.createElement('iframe');
  iframeChat.src = `https://webchat-embed.vercel.app/?dominio=${encodeURIComponent(config.dominio)}&empresaId=${encodeURIComponent(config.empresaId)}`;
  iframeChat.style.position = 'fixed';
  iframeChat.style.bottom = config.posicao.includes('bottom') ? '80px' : 'unset';
  iframeChat.style.top = config.posicao.includes('top') ? '80px' : 'unset';
  iframeChat.style.right = config.posicao.includes('right') ? '20px' : 'unset';
  iframeChat.style.left = config.posicao.includes('left') ? '20px' : 'unset';
  iframeChat.style.width = '350px';
  iframeChat.style.height = '500px';
  iframeChat.style.border = 'none';
  iframeChat.style.zIndex = '9999';
  iframeChat.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.3)';
  iframeChat.style.display = 'none';
  document.body.appendChild(iframeChat);

  // Alterna visibilidade
  botaoChat.addEventListener('click', () => {
    const visivel = iframeChat.style.display === 'block';
    iframeChat.style.display = visivel ? 'none' : 'block';
  });
})();
