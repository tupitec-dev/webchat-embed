import React, { useState } from 'react';
// Importe o CSS Module
import styles from './FormularioLead.module.css';

type FormularioLeadProps = {
  onSubmit: (nome: string, telefone: string) => void;
};

const FormularioLead: React.FC<FormularioLeadProps> = ({ onSubmit }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');

  // A lógica da máscara, validação e submit permanece a mesma...
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
    // Aplica as classes de estilo ao JSX
    <div className={styles.formContainer}>
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