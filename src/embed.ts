const scriptTag = document.currentScript as HTMLScriptElement | null;

const cor = scriptTag?.getAttribute('data-cor') || '#007bff';
const posicao = scriptTag?.getAttribute('data-posicao') || 'bottom-right';
const icone = scriptTag?.getAttribute('data-icone') || '💬';
const dominio = scriptTag?.getAttribute('data-dominio') || window.location.hostname;

// Cria botão flutuante
const botao = document.createElement('button');
botao.innerText = icone;
botao.style.position = 'fixed';
botao.style.bottom = posicao.includes('bottom') ? '20px' : 'unset';
botao.style.top = posicao.includes('top') ? '20px' : 'unset';
botao.style.right = posicao.includes('right') ? '20px' : 'unset';
botao.style.left = posicao.includes('left') ? '20px' : 'unset';
botao.style.backgroundColor = cor;
botao.style.color = '#fff';
botao.style.border = 'none';
botao.style.borderRadius = '50%';
botao.style.width = '56px';
botao.style.height = '56px';
botao.style.fontSize = '24px';
botao.style.cursor = 'pointer';
botao.style.zIndex = '9999';

document.body.appendChild(botao);

// Abre iframe do chat ao clicar
botao.addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = `https://webchat-embed.vercel.app/?dominio=${dominio}`;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '80px';
  iframe.style.right = '20px';
  iframe.style.width = '350px';
  iframe.style.height = '500px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';
  iframe.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.3)';
  document.body.appendChild(iframe);

  botao.style.display = 'none';
});
