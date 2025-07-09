import React, { useState, useRef, useEffect } from 'react';
import styles from './JanelaChat.module.css';
import { useEmpresa } from '../context/EmpresaContext';
import { gerarPromptPersonalizado } from '../utils/gerarPrompt';
import {
  enviarMensagemParaIA,
  gerarResumoDaConversa,
} from '../services/chatService';
import { salvarConversa } from '../services/conversaService';

type JanelaChatProps = {
  onFechar: () => void;
};

interface Mensagem {
  autor: 'cliente' | 'ia';
  texto: string;
  hora: string;
}

const FRASES_ENCERRAMENTO = [
  'obrigado',
  'era só isso',
  'pode encerrar',
  'tchau',
  'até mais',
  'valeu',
];

const FRASES_ATENDIMENTO_HUMANO = [
  'quero falar com atendente',
  'quero falar com humano',
  'preciso de um atendente',
  'tem alguém aí?',
  'humano',
  'falar com pessoa',
];

const TEMPO_INATIVIDADE_MS = 5 * 60 * 1000; // 5 minutos

const JanelaChat: React.FC<JanelaChatProps> = ({ onFechar }) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [solicitandoContato, setSolicitandoContato] = useState(false);
  const [resumoGerado, setResumoGerado] = useState<string | undefined>(undefined);
  const [clienteNome, setClienteNome] = useState<string | undefined>(undefined);
  const [contato, setContato] = useState<string | undefined>(undefined);

  const mensagensRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const { empresa, atendente, informacoes } = useEmpresa();

  useEffect(() => {
    mensagensRef.current?.scrollTo(0, mensagensRef.current.scrollHeight);
  }, [mensagens]);

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

  const verificarEncerramento = (texto: string): boolean => {
    const lower = texto.toLowerCase();
    return FRASES_ENCERRAMENTO.some((frase) => lower.includes(frase));
  };

  const verificarPedidoHumano = (texto: string): boolean => {
    const lower = texto.toLowerCase();
    return FRASES_ATENDIMENTO_HUMANO.some((frase) => lower.includes(frase));
  };

  const salvar = async (resumo?: string) => {
    if (!empresa || !atendente) return;
    await salvarConversa({
      empresa_id: parseInt(empresa.id),
      atendente_nome: atendente.nome,
      mensagens,
      resumo,
      cliente_nome: clienteNome,
      contato,
    });
  };

  const processarContatoCliente = (texto: string) => {
    const temEmail = /\S+@\S+\.\S+/.test(texto);
    const temTelefone = /\b\d{8,}\b/.test(texto);
    const partes = texto.split(/[\n,;-]/).map(p => p.trim()).filter(Boolean);

    for (const parte of partes) {
      if (!clienteNome && parte.length >= 3 && !temEmail && !/\d/.test(parte)) {
        setClienteNome(parte);
      }
      if (!contato && (temEmail || temTelefone)) {
        setContato(parte);
      }
    }

    if ((clienteNome || contato) && (temEmail || temTelefone)) {
      return true;
    }

    return false;
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

      // Se estamos aguardando nome e contato:
      if (solicitandoContato && resumoGerado) {
        const completou = processarContatoCliente(novaMensagem.texto);

        if (completou) {
          const resposta: Mensagem = {
            autor: 'ia',
            texto:
              'Perfeito! Nossa equipe entrará em contato com você pelo WhatsApp. Fique atento! 📱',
            hora: new Date().toISOString(),
          };
          setMensagens((m) => [...m, resposta]);
          await salvar(resumoGerado);
          setSolicitandoContato(false);
          setResumoGerado(undefined);
        } else {
          const repetir: Mensagem = {
            autor: 'ia',
            texto: 'Pode me informar seu nome e um número de WhatsApp ou e-mail para contato? 😊',
            hora: new Date().toISOString(),
          };
          setMensagens((m) => [...m, repetir]);
        }
        return;
      }

      // Se o cliente pediu atendimento humano
      if (verificarPedidoHumano(novaMensagem.texto)) {
        const resumo = await gerarResumoDaConversa([...mensagens, novaMensagem]);
        setResumoGerado(resumo);
        setSolicitandoContato(true);

        const respostaIA: Mensagem = {
          autor: 'ia',
          texto:
            'Certo! Já estou preparando o encaminhamento para um atendente humano. 😊\n\nAntes disso, poderia me informar seu nome e um telefone ou e-mail para que nossa equipe entre em contato com você?',
          hora: new Date().toISOString(),
        };

        setMensagens((m) => [...m, respostaIA]);
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

      setMensagens((m) => [...m, respostaMensagem]);

      if (verificarEncerramento(novaMensagem.texto)) {
        await salvar();
      }
    } catch (err) {
      console.error('Erro na IA:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') enviar();
  };

  return (
    <div className={styles.janelaChat}>
      <div className={styles.janelaChatHeader}>
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
        >
          ✖
        </button>
      </div>

      <div ref={mensagensRef} className={styles.janelaChatBody}>
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
                backgroundColor:
                  msg.autor === 'cliente' ? '#e0f7fa' : '#e8eaf6',
                padding: '6px 10px',
                borderRadius: '12px',
                maxWidth: '80%',
              }}
            >
              {msg.texto}
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

      <div className={styles.janelaChatFooter}>
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={enviar}>Enviar</button>
      </div>
    </div>
  );
};

export default JanelaChat;
