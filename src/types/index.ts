/// <reference types="vite/client" />
export interface Empresa {
  id: string;
  nome: string;
  dominio: string;
  pagamento_ok: boolean;
  situacao: string;
}

export interface Atendente {
  nome: string;
  estilo_personalidade: string;
  dialeto: string;
}