import React, { useState } from 'react';

type FormularioLeadProps = {
  onSubmit: (nome: string, telefone: string) => void;
};

const FormularioLead: React.FC<FormularioLeadProps> = ({ onSubmit }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');

  const validar = () => {
    if (!nome.trim() || !telefone.trim()) {
      setErro('Por favor, preencha todos os campos.');
      return false;
    }
    if (!/\d{8,}/.test(telefone)) {
      setErro('Digite um telefone válido.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validar()) {
      setErro('');
      onSubmit(nome.trim(), telefone.trim());
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        maxWidth: '100%',
      }}
    >
      <h3 style={{ marginBottom: '16px', color: '#333' }}>Antes de começar:</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />

        <input
          type="tel"
          placeholder="Telefone ou WhatsApp"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />

        {erro && (
          <div style={{ color: 'red', fontSize: '14px' }}>
            {erro}
          </div>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            padding: '10px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Iniciar atendimento
        </button>
      </form>
    </div>
  );
};

export default FormularioLead;
