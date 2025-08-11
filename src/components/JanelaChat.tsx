import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useEmpresa } from '../context/EmpresaContext';
import { gerarPromptPersonalizado } from '../utils/gerarPrompt';
import { enviarMensagemParaIA } from '../services/chatService';
import { salvarConversa } from '../services/conversaService';
import FormularioLead from './FormularioLead';
import styles from './JanelaChat.module.css';
import { linkifyText } from '../utils/linkify';


interface JanelaChatProps {
  onFechar?: () => void;
}

interface Mensagem {
  autor: 'cliente' | 'ia';
  texto: string;
  hora: string;
}

const TEMPO_INATIVIDADE_MS = 5 * 60 * 1000;

const JanelaChat: React.FC<JanelaChatProps> = ({ onFechar }) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [contato, setContato] = useState('');
  const [leadPreenchido, setLeadPreenchido] = useState(false);

  const mensagensRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { empresa, atendente, informacoes } = useEmpresa();

  // ===== THEME: lê params da URL e aplica como CSS vars no container =====
  const themeVars = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const v: Record<string, string> = {};
    const map: Record<string, string> = {
      brand: '--chat-brand',
      brandDark: '--chat-brand-dark',
      onBrand: '--chat-on-brand',
      surface: '--chat-surface',
      surface2: '--chat-surface-2',
      border: '--chat-border',
      muted: '--chat-muted',
      text: '--chat-text',
      focusRing: '--chat-focus-ring',
    };
    Object.entries(map).forEach(([q, cssVar]) => {
      const val = p.get(q);
      if (val) v[cssVar] = val;
    });
    return v as React.CSSProperties;
  }, []);
  // =====================================================================

  useEffect(() => {
    mensagensRef.current?.scrollTo(0, mensagensRef.current.scrollHeight);
  }, [mensagens, carregando]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleUnload = () => salvar();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [mensagens, clienteNome, contato]);

  useEffect(() => {
    if (leadPreenchido) {
      inputRef.current?.focus();
    }
  }, [leadPreenchido]);

  const iniciarTimeoutInatividade = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => salvar(), TEMPO_INATIVIDADE_MS);
  };

  const salvar = async (resumo?: string) => {
    if (!empresa || !atendente || mensagens.length === 0) return;
    await salvarConversa({
      empresa_id: parseInt(empresa.id),
      atendente_nome: atendente.nome,
      mensagens,
      cliente_nome: clienteNome,
      contato,
      resumo,
    });
  };

  const detectarPedidoDeAtendente = (texto: string): boolean => {
    const frases = [
      'falar com atendente', 'me chama no whatsapp', 'pode me ligar',
      'quero atendimento humano', 'quero falar com alguém', 'alguém me chama',
      'quero falar com uma pessoa', 'atendente', 'pessoa de verdade',
    ];
    return frases.some(frase => texto.toLowerCase().includes(frase));
  };

  const gerarResumoDaConversa = async (): Promise<string> => {
    const mensagensCliente = mensagens
      .filter(m => m.autor === 'cliente')
      .map(m => m.texto)
      .join('\n');

    const prompt = `Resuma de forma clara e objetiva a seguinte conversa de um cliente:\n\n${mensagensCliente}`;
    try {
      return await enviarMensagemParaIA({ promptSistema: prompt, mensagens: [] });
    } catch {
      return 'Resumo indisponível.';
    }
  };

  const enviar = async () => {
    if (!texto.trim() || carregando) return;

    const novaMensagem: Mensagem = {
      autor: 'cliente',
      texto: texto.trim(),
      hora: new Date().toISOString(),
    };
    setMensagens(m => [...m, novaMensagem]);
    setTexto('');
    setCarregando(true);
    iniciarTimeoutInatividade();

    try {
      if (!empresa || !atendente) throw new Error('Dados da empresa ou atendente não carregados.');

      const pediuAtendente = detectarPedidoDeAtendente(novaMensagem.texto);
      if (pediuAtendente) {
        const resumo = await gerarResumoDaConversa();
        await salvar(resumo);
        const resposta: Mensagem = {
          autor: 'ia',
          texto: 'Claro! Um de nossos atendentes entrará em contato com você em breve pelo WhatsApp. Obrigado! 😊',
          hora: new Date().toISOString(),
        };
        setMensagens(m => [...m, resposta]);
        return;
      }

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
      setMensagens(m => [...m, respostaMensagem]);
    } catch (err) {
      console.error('Erro na IA:', err);
      const erroMensagem: Mensagem = {
        autor: 'ia',
        texto: 'Desculpe, estou com um problema para me conectar. Por favor, tente novamente em alguns instantes.',
        hora: new Date().toISOString(),
      };
      setMensagens(m => [...m, erroMensagem]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') enviar();
  };

  if (!leadPreenchido) {
    return (
      <FormularioLead
        onSubmit={(nome, tel) => {
          setClienteNome(nome);
          setContato(tel);
          setLeadPreenchido(true);
        }}
        onClose={() => window.parent.postMessage({ action: 'fechar-chat' }, '*')}
      />
    );
  }

  return (
    <div className={styles.janelaChat} style={themeVars}>
      <header className={styles.header}>
        <strong className={styles.headerTitle}>{atendente?.nome || 'Atendente'}</strong>

        <button
          onClick={() => {
            onFechar?.();
            window.parent.postMessage({ action: 'fechar-chat' }, '*');
          }}
          className={styles.closeButton}
          aria-label="Fechar chat"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor" /* herda cor do .closeButton */
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <main ref={mensagensRef} className={styles.messagesContainer}>
        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={`${styles.messageRow} ${msg.autor === 'cliente' ? styles.messageRowCliente : ''}`}
          >
            <div
              className={`${styles.messageBubble} ${msg.autor === 'cliente' ? styles.messageBubbleCliente : ''}`}
            >
              // dentro da bolha de mensagem:
              {linkifyText(msg.texto, { phones: 'tel', newTab: true })}

            </div>
          </div>
        ))}
        {carregando && (
          <div className={`${styles.messageRow} ${styles.typingIndicator}`}>
            <div className={styles.messageBubble}>Digitando...</div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Digite sua mensagem..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.textInput}
          disabled={carregando}
        />
        <button onClick={enviar} className={styles.sendButton} disabled={carregando}>
          <SendIcon />
        </button>
      </footer>
    </div>
  );
};

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor" /* herda cor do .sendButton */
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export default JanelaChat;
