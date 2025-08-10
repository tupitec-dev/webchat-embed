import React, { useState, useMemo } from 'react';
import styles from './FormularioLead.module.css';

type FormularioLeadProps = {
  onSubmit: (nome: string, telefone: string) => void;
  onClose: () => void;
};

const FormularioLead: React.FC<FormularioLeadProps> = ({ onSubmit, onClose }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');

  // ===== THEME: lê params da URL e aplica como CSS vars =====
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
  // =========================================================

  const aplicarMascaraTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length === 0) return '';
    if (numeros.length <= 2) return `(${numeros}`;
    let mascara = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length === 11) {
      mascara = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (mascara.length > 9) {
      mascara = `${mascara.slice(0, 9)}-${mascara.slice(9)}`;
    }
    return mascara;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(aplicarMascaraTelefone(e.target.value));
  };

  const validar = () => {
    const numeros = telefone.replace(/\D/g, '');
    if (!nome.trim() || !numeros) {
      setErro('Por favor, preencha todos os campos.');
      return false;
    }
    if (numeros.length < 10 || numeros.length > 11) {
      setErro('Digite um telefone válido com DDD.');
      return false;
    }
    setErro('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validar()) {
      onSubmit(nome.trim(), telefone.replace(/\D/g, ''));
    }
  };

  return (
    <div className={styles.formContainer} style={themeVars}>
      <button onClick={onClose} className={styles.closeButton} aria-label="Fechar chat">
        ✖
      </button>

      <h3 className={styles.title}>Antes de começar:</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={styles.input}
        />

        <input
          type="tel"
          placeholder="Telefone ou WhatsApp"
          value={telefone}
          onChange={handleTelefoneChange}
          maxLength={15}
          className={styles.input}
        />

        {erro && <div className={styles.error}>{erro}</div>}

        <button type="submit" className={styles.submitButton}>
          Iniciar atendimento
        </button>
      </form>
    </div>
  );
};

export default FormularioLead;
