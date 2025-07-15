import React, { useState } from 'react';

type FormularioLeadProps = {
  onSubmit: (nome: string, telefone: string) => void;
};

const FormularioLead: React.FC<FormularioLeadProps> = ({ onSubmit }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');

  const aplicarMascaraTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTelefone(aplicarMascaraTelefone(valor));
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
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validar()) {
      setErro('');
      const telefoneLimpo = telefone.replace(/\D/g, '');
      onSubmit(nome.trim(), telefoneLimpo);

      // 🔔 Dispara evento global com o telefone
      window.postMessage({ tipo: 'lead_preenchido', telefone: telefoneLimpo }, '*');
    }
  };


  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: 'none',
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
          onChange={handleTelefoneChange}
          maxLength={15}
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
