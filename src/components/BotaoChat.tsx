import React from 'react';

type BotaoChatProps = {
  onClick: () => void;
};

const BotaoChat: React.FC<BotaoChatProps> = ({ onClick }) => {
  // Lê o script que carregou o chat
  const scriptTag = document.querySelector('script[data-empresa]');

  const cor = scriptTag?.getAttribute('data-cor') || '#007bff';
  const posicao = scriptTag?.getAttribute('data-posicao') || 'bottom-right';
  const icone = scriptTag?.getAttribute('data-icone') || '💬';

  // Define estilo da posição
  const posicoes: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };

  const posicaoStyle = posicoes[posicao] || posicoes['bottom-right'];

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: cor,
        color: '#fff',
        fontSize: '24px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        zIndex: 9999,
        ...posicaoStyle,
      }}
    >
      {icone}
    </button>
  );
};

export default BotaoChat;
