(() => {
  let config = (window as any).WebChatTupitecConfig || {};
  const scriptTag = document.currentScript as HTMLScriptElement | null;

  if (scriptTag) {
    config = {
      ...config,
      cor: scriptTag.getAttribute('data-cor') || config.cor || '#007bff',
      posicao: scriptTag.getAttribute('data-posicao') || config.posicao || 'bottom-right',
      icone: scriptTag.getAttribute('data-icone') || config.icone || '',
      dominio: scriptTag.getAttribute('data-dominio') || config.dominio || window.location.hostname,
      empresaId: scriptTag.getAttribute('data-empresaid') || config.empresaId || '',
    };
  }

  const posicoes: Record<string, Partial<CSSStyleDeclaration>> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };

  const posicaoStyle = posicoes[config.posicao] || posicoes['bottom-right'];

  // Cria botão
  const botaoChat = document.createElement('button');
  botaoChat.setAttribute('aria-label', 'Abrir chat');

  Object.assign(botaoChat.style, {
    position: 'fixed',
    background: 'transparent',
    border: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    zIndex: '9999',
    ...posicaoStyle,
  });

  if (config.icone.startsWith('http')) {
    // Se for uma URL (ex: SVG externo)
    const img = document.createElement('img');
    img.src = config.icone;
    img.alt = 'Abrir chat';
    img.style.width = '64px';
    img.style.height = '64px';
    botaoChat.appendChild(img);
  } else {
    // Ícone padrão (SVG inline)
    botaoChat.innerHTML = `
      <svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="${config.cor}" />
        <path d="M20 24h24v16H23l-3 4V24z" fill="#fff" />
      </svg>
    `;
  }

  document.body.appendChild(botaoChat);

  const iframeChat = document.createElement('iframe');
  iframeChat.src = `https://webchat-embed.vercel.app/?dominio=${encodeURIComponent(config.dominio)}&empresaId=${encodeURIComponent(config.empresaId)}`;
  Object.assign(iframeChat.style, {
    position: 'fixed',
    width: '350px',
    height: '500px',
    border: 'none',
    zIndex: '9999',
    boxShadow: '0 0 12px rgba(0, 0, 0, 0.3)',
    display: 'none',
    ...(config.posicao.includes('bottom') ? { bottom: '80px' } : { top: '80px' }),
    ...(config.posicao.includes('right') ? { right: '20px' } : { left: '20px' }),
  });

  document.body.appendChild(iframeChat);

  botaoChat.addEventListener('click', () => {
    const visivel = iframeChat.style.display === 'block';
    iframeChat.style.display = visivel ? 'none' : 'block';
  });
})();
