import React from 'react';

type BotaoChatProps = {
  onClick: () => void;
};

const BotaoChat: React.FC<BotaoChatProps> = ({ onClick }) => {
  const scriptTag = document.querySelector('script[data-empresa]');

  const posicao = scriptTag?.getAttribute('data-posicao') || 'bottom-right';
  const icone = scriptTag?.getAttribute('data-icone') || '';

  const posicoes: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };

  const posicaoStyle = posicoes[posicao] || posicoes['bottom-right'];

  const isUrl = icone.startsWith('http');

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        zIndex: 9999,
        ...posicaoStyle,
      }}
      aria-label="Abrir chat"
    >
      {isUrl ? (
      <img
        src={icone}
        alt="Abrir chat"
        style={{
          width: '64px',
          height: '64px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', // ⬅️ sombra sutil
          borderRadius: '50%',                         // ⬅️ ajuda se imagem tiver fundo transparente
        }}
      />

      ) : (
        <svg
          viewBox="0 0 64 64"
          width="64"
          height="64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="32" r="30" fill="#007bff" />
          <path d="M20 24h24v16H23l-3 4V24z" fill="#fff" />
        </svg>
      )}
    </button>
  );
};

export default BotaoChat;
