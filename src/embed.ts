(() => {
  // 1) Lê configurações da <script> (inclui novas cores opcionais)
  const scriptTag = document.currentScript as HTMLScriptElement;
  const get = (name: string, fallback = '') =>
    scriptTag?.getAttribute(name) || fallback;

  const config = {
    cor:        get('data-cor', '#007bff'),
    posicao:    get('data-posicao', 'bottom-right'),
    icone:      get('data-icone', ''),
    dominio:    get('data-dominio', window.location.hostname),
    empresaId:  get('data-empresaid', ''),

    // NOVOS (todos opcionais)
    corEscura:  get('data-cor-escura', ''),         // ex: #0056b3
    onBrand:    get('data-on-brand', ''),           // ex: #ffffff
    surface:    get('data-surface', ''),            // ex: #ffffff
    surface2:   get('data-surface2', ''),           // ex: #f8f9fa
    border:     get('data-border', ''),             // ex: #e2e8f0
    muted:      get('data-muted', ''),              // ex: #cbd5e0
    text:       get('data-text', ''),               // ex: #212529
    focusRing:  get('data-focus-ring', ''),         // ex: rgba(0,123,255,.15)
  };

  // 2) Botão flutuante
  const botaoChat = document.createElement('button');
  botaoChat.setAttribute('aria-label', 'Abrir chat');

  const posicoes: Record<string, Partial<CSSStyleDeclaration>> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left':  { bottom: '20px', left: '20px' },
    'top-right':    { top: '20px', right: '20px' },
    'top-left':     { top: '20px', left: '20px' },
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
    img.style.filter = 'drop-shadow(0 6px 16px rgba(0,0,0,.25))';
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

  // 3) CSS do iframe (corrige mobile: sem offset de 80px)
  // 3) CSS do iframe
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    #tupitec-webchat-iframe {
      position: fixed;
      z-index: 10000;
      border: none;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      width: 370px;
      height: 600px;
      ${config.posicao.includes('bottom') ? `bottom: 90px;` : `top: 90px;`}
      ${config.posicao.includes('right') ? `right: 20px;` : `left: 20px;`}
      display: none;
      overflow: hidden;
      transition: width 0.3s, height 0.3s;
      background: transparent;
    }

    @media (max-width: 600px) {
      #tupitec-webchat-iframe {
        position: fixed;
        top: 80px;               /* deixa espaço para o cabeçalho fixo */
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: calc(100dvh - 80px); /* ocupa o restante da tela */
        border-radius: 16px;     /* cantos arredondados no mobile */
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      }
    }
  `;
  document.head.appendChild(styleElement);


  // 4) Iframe + querystring com tema
  const params = new URLSearchParams({
    dominio:   config.dominio,
    empresaId: config.empresaId,
    // Tema (enviado só se existir)
    ...(config.cor        ? { brand: config.cor } : {}),
    ...(config.corEscura  ? { brandDark: config.corEscura } : {}),
    ...(config.onBrand    ? { onBrand: config.onBrand } : {}),
    ...(config.surface    ? { surface: config.surface } : {}),
    ...(config.surface2   ? { surface2: config.surface2 } : {}),
    ...(config.border     ? { border: config.border } : {}),
    ...(config.muted      ? { muted: config.muted } : {}),
    ...(config.text       ? { text: config.text } : {}),
    ...(config.focusRing  ? { focusRing: config.focusRing } : {}),
  });

  const iframeChat = document.createElement('iframe');
  iframeChat.id = 'tupitec-webchat-iframe';
  iframeChat.title = 'Chat de Atendimento';
  iframeChat.src = `https://webchat-embed.vercel.app/?${params.toString()}`;
  document.body.appendChild(iframeChat);

  // 5) Eventos
  botaoChat.addEventListener('click', () => {
    const isVisible = iframeChat.style.display === 'block';
    iframeChat.style.display = isVisible ? 'none' : 'block';
  });

  window.addEventListener('message', (event) => {
    if (event.source !== iframeChat.contentWindow) return;
    if (event.data.action === 'fechar-chat') {
      iframeChat.style.display = 'none';
    }
  });
})();
