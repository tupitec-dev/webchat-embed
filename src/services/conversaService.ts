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

// Salva a conversa no Supabase
export async function salvarConversa(conversa: NovaConversa) {
  try {
    if (!conversa.empresa_id || !conversa.atendente_nome || conversa.mensagens.length === 0) {
      console.warn('⚠️ Dados incompletos para salvar a conversa:', conversa);
      return;
    }

    const { error } = await supabase.from('conversas').insert([conversa]);

    if (error) {
      console.error('❌ Erro ao salvar conversa no Supabase:', error.message);
    } else {
      console.log('✅ Conversa salva com sucesso.');
    }
  } catch (erro) {
    console.error('❌ Erro inesperado ao salvar conversa:', erro);
  }
}
