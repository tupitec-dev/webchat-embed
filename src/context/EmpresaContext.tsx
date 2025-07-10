import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Empresa {
  id: string;
  nome: string;
  dominio: string;
  pagamento_ok: boolean;
  situacao: string;
}

interface Atendente {
  nome: string;
  estilo_personalidade: string;
  dialeto: string;
}

interface EmpresaContextType {
  empresa: Empresa | null;
  informacoes: Record<string, string>;
  atendente: Atendente | null;
  carregando: boolean;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresa: null,
  informacoes: {},
  atendente: null,
  carregando: true,
});

export const useEmpresa = () => useContext(EmpresaContext);

export const EmpresaProvider = ({ children }: { children: React.ReactNode }) => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [informacoes, setInformacoes] = useState<Record<string, string>>({});
  const [atendente, setAtendente] = useState<Atendente | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let tentativas = 0;

    const verificarConfig = () => {
      const config = (window as any).WebChatTupitecConfig;
      // Garante que um ID vazio (empresaId: '') seja tratado como não encontrado
      const empresaId = config?.empresaId && config.empresaId.trim();

      if (empresaId) {
        console.log('🔍 Buscando dados para empresa ID:', empresaId);
        carregarDados(empresaId);
        return true;
      }

      tentativas++;
      if (tentativas > 20) {
        // --- ATUALIZAÇÃO INICIA AQUI ---
        // Se o ID não for encontrado, usa o ID padrão '21' para teste.
        console.warn('⚠️ ID da empresa não encontrado. Usando ID padrão para teste: 21');
        carregarDados('21');
        return true; // Para o intervalo
        // --- ATUALIZAÇÃO TERMINA AQUI ---
      }

      return false;
    };

    const intervalo = setInterval(() => {
      const pronto = verificarConfig();
      if (pronto) clearInterval(intervalo);
    }, 250); // Verifica a cada 250ms, por até 5s

    return () => clearInterval(intervalo);
  }, []);

  const carregarDados = async (empresaId: string) => {
    try {
      const { data: empresas, error: erroEmpresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .limit(1);

      if (erroEmpresa) {
        console.error('❌ Erro ao buscar empresa:', erroEmpresa);
        setCarregando(false);
        return;
      }

      if (!empresas || empresas.length === 0) {
        console.warn('⚠️ Nenhuma empresa encontrada com ID:', empresaId);
        setCarregando(false);
        return;
      }

      const empresaData = empresas[0];
      setEmpresa(empresaData);
      console.log('✅ Empresa encontrada:', empresaData);

      const { data: info, error: erroInfo } = await supabase
        .from('informacoes_empresa')
        .select('*')
        .eq('empresa_id', empresaId);

      if (erroInfo) {
        console.warn('⚠️ Erro ao buscar informações da empresa:', erroInfo);
      }

      const infoMap: Record<string, string> = {};
      info?.forEach((item) => {
        infoMap[item.chave] = item.valor;
      });
      setInformacoes(infoMap);
      console.log('ℹ️ Informações adicionais:', infoMap);

      const { data: atendentes, error: erroAtendentes } = await supabase
        .from('atendentes')
        .select('*')
        .eq('empresa_id', empresaId);

      if (erroAtendentes) {
        console.warn('⚠️ Erro ao buscar atendentes:', erroAtendentes);
      }

      if (atendentes && atendentes.length > 0) {
        const aleatorio = atendentes[Math.floor(Math.random() * atendentes.length)];
        setAtendente(aleatorio);
        console.log('🙋‍♀️ Atendente selecionado:', aleatorio);
      }

      setCarregando(false);
    } catch (erro) {
      console.error('❌ Erro inesperado ao carregar dados da empresa:', erro);
      setCarregando(false);
    }
  };

  return (
    <EmpresaContext.Provider value={{ empresa, informacoes, atendente, carregando }}>
      {children}
    </EmpresaContext.Provider>
  );
};