import { supabase } from '../lib/supabase';


interface Mensagem {
  autor: 'cliente' | 'ia';
  texto: string;
  hora: string; // ISO string
}

interface NovaConversa {
  empresa_id: number;
  atendente_nome: string;
  mensagens: Mensagem[];
  cliente_nome?: string;
  contato?: string;
  login?: string;
  resumo?: string;
}

export async function salvarConversa(conversa: NovaConversa) {
  const { error } = await supabase.from('conversas').insert([conversa]);

  if (error) {
    console.error('Erro ao salvar conversa no Supabase:', error.message);
  } else {
    //console.log('✅ Conversa salva com sucesso!');
  }
}
