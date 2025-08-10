(() => {
  // 1. LÊ AS CONFIGURAÇÕES DA TAG <script>
  const scriptTag = document.currentScript as HTMLScriptElement;
  const config = {
    cor: scriptTag?.getAttribute('data-cor') || '#007bff',
    posicao: scriptTag?.getAttribute('data-posicao') || 'bottom-right',
    icone: scriptTag?.getAttribute('data-icone') || '',
    dominio: scriptTag?.getAttribute('data-dominio') || window.location.hostname,
    empresaId: scriptTag?.getAttribute('data-empresaid') || '',
  };

  // 2. CRIA O BOTÃO FLUTUANTE
  const botaoChat = document.createElement('button');
  botaoChat.setAttribute('aria-label', 'Abrir chat');
  const posicoes: Record<string, Partial<CSSStyleDeclaration>> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };
  Object.assign(botaoChat.style, {
    position: 'fixed',
    background: 'transparent',
    border: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    zIndex: '9999',
    ...(posicoes[config.posicao] || posicoes['bottom-right']),
  });

  if (config.icone.startsWith('http')) {
    const img = document.createElement('img');
    img.src = config.icone;
    img.alt = 'Abrir chat';
    img.style.width = '64px';
    img.style.height = '64px';
    botaoChat.appendChild(img);
  } else {
    botaoChat.innerHTML = `
      <svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="${config.cor}" />
        <path d="M20 24h24v16H23l-3 4V24z" fill="#fff" />
      </svg>
    `;
  }
  document.body.appendChild(botaoChat);

  // 3. CRIA E INJETA O CSS PARA O IFRAME
  const styleElement = document.createElement('style');
  const cssStyles = `
    #tupitec-webchat-iframe {
      /* Estilos Padrão (Desktop) */
      position: fixed;
      z-index: 10000;
      border: none;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      width: 370px;
      height: 600px;
      ${config.posicao.includes('bottom') ? `bottom: 90px;` : `top: 90px;`}
      ${config.posicao.includes('right') ? `right: 20px;` : `left: 20px;`}
      display: none; /* Começa escondido */
      overflow: hidden;
      transition: width 0.3s, height 0.3s;
    }

    /* Estilos para Mobile */
    @media (max-width: 600px) {
      #tupitec-webchat-iframe {
        top: 80px;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: calc(100% - 80px);
        border-radius: 0;
        box-shadow: none;
        ${config.posicao.includes('bottom') ? `bottom: 0;` : ``}
        ${config.posicao.includes('right') ? `right: 0;` : ``}
      }
    }
  `;
  styleElement.textContent = cssStyles;
  document.head.appendChild(styleElement);

  // 4. CRIA O IFRAME
  const iframeChat = document.createElement('iframe');
  iframeChat.id = 'tupitec-webchat-iframe'; // Atribui o ID que o CSS usa
  iframeChat.src = `https://webchat-embed.vercel.app/?dominio=${encodeURIComponent(config.dominio)}&empresaId=${encodeURIComponent(config.empresaId)}`;
  iframeChat.title = 'Chat de Atendimento';
  document.body.appendChild(iframeChat);

  // 5. ADICIONA OS EVENTOS
  botaoChat.addEventListener('click', () => {
    const isVisible = iframeChat.style.display === 'block';
    iframeChat.style.display = isVisible ? 'none' : 'block';
  });
  
  window.addEventListener('message', (event) => {
    if (event.source !== iframeChat.contentWindow) return; // Verificação de segurança
    
    if (event.data.action === 'fechar-chat') {
      iframeChat.style.display = 'none';
    }
  });

})();