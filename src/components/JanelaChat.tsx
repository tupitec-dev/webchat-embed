import React, { useState, useRef, useEffect } from 'react';
import { useEmpresa } from '../context/EmpresaContext';
import { gerarPromptPersonalizado } from '../utils/gerarPrompt';
import { enviarMensagemParaIA } from '../services/chatService';
import { salvarConversa } from '../services/conversaService';
import FormularioLead from './FormularioLead';

interface JanelaChatProps {
  onFechar: () => void;
}

interface Mensagem {
  autor: 'cliente' | 'ia';
  texto: string;
  hora: string;
}

const TEMPO_INATIVIDADE_MS = 5 * 60 * 1000;

function formatarMensagem(texto: string): string {
  const markdownLinks = texto.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const comLinks = markdownLinks.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    if (url.includes('href=')) return url;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
  return comLinks;
}

const JanelaChat: React.FC<JanelaChatProps> = ({ onFechar }) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [contato, setContato] = useState('');
  const [leadPreenchido, setLeadPreenchido] = useState(false);

  const mensagensRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const { empresa, atendente, informacoes } = useEmpresa();

  useEffect(() => {
    mensagensRef.current?.scrollTo(0, mensagensRef.current.scrollHeight);
  }, [mensagens, carregando]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const iniciarTimeoutInatividade = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      await salvar();
    }, TEMPO_INATIVIDADE_MS);
  };

  const salvar = async () => {
    if (!empresa || !atendente) return;
    await salvarConversa({
      empresa_id: parseInt(empresa.id),
      atendente_nome: atendente.nome,
      mensagens,
      cliente_nome: clienteNome,
      contato,
    });
  };

  const enviar = async () => {
    if (!texto.trim()) return;

    const novaMensagem: Mensagem = {
      autor: 'cliente',
      texto: texto.trim(),
      hora: new Date().toISOString(),
    };

    setMensagens((m) => [...m, novaMensagem]);
    setTexto('');
    setCarregando(true);
    iniciarTimeoutInatividade();

    try {
      if (!empresa || !atendente) return;

      const prompt = gerarPromptPersonalizado({ empresa, informacoes, atendente });
      const respostaTexto = await enviarMensagemParaIA({
        promptSistema: prompt,
        mensagens: [{ role: 'user', content: novaMensagem.texto }],
      });

      const respostaMensagem: Mensagem = {
        autor: 'ia',
        texto: respostaTexto,
        hora: new Date().toISOString(),
      };

      setMensagens((m) => [...m, respostaMensagem]);
    } catch (err) {
      console.error('Erro na IA:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') enviar();
  };

  if (!leadPreenchido) {
    return (
      <div
        style={{
          width: '350px',
          height: '500px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: 16,
          boxSizing: 'border-box',
          border: '1px solid #ccc',
        }}
      >
        <FormularioLead
          onSubmit={(nome, tel) => {
            setClienteNome(nome);
            setContato(tel);
            setLeadPreenchido(true);
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '350px',
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <strong>{atendente?.nome || 'Atendente'}</strong>
        <button
          onClick={onFechar}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
          }}
          aria-label="Fechar chat"
        >
          ✖
        </button>
      </div>

      {/* Mensagens */}
      <div
        ref={mensagensRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 10,
          boxSizing: 'border-box',
        }}
      >
        {mensagens.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.autor === 'cliente' ? 'right' : 'left',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: msg.autor === 'cliente' ? '#e0f7fa' : '#e8eaf6',
                padding: '6px 10px',
                borderRadius: '12px',
                maxWidth: '80%',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              <span
                dangerouslySetInnerHTML={{ __html: formatarMensagem(msg.texto) }}
              />
            </div>
          </div>
        ))}

        {carregando && (
          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#e8eaf6',
                padding: '6px 10px',
                borderRadius: '12px',
              }}
            >
              Digitando...
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: 10,
          display: 'flex',
          borderTop: '1px solid #ccc',
          gap: 8,
          backgroundColor: '#fff',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={enviar}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default JanelaChat;
