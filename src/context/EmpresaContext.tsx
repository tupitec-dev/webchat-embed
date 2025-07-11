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
    const params = new URLSearchParams(window.location.search);
    const dominio = params.get('dominio') || window.location.hostname;

    if (dominio) {
      console.log('🌐 Buscando empresa pelo domínio:', dominio);
      carregarDados(dominio);
    } else {
      console.error('❌ Domínio não encontrado na URL.');
      setCarregando(false);
    }
  }, []);

  const carregarDados = async (dominio: string) => {
    try {
      const { data: empresas, error: erroEmpresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('dominio', dominio)
        .limit(1);

      if (erroEmpresa) {
        console.error('❌ Erro ao buscar empresa pelo domínio:', erroEmpresa);
        setCarregando(false);
        return;
      }

      if (!empresas || empresas.length === 0) {
        console.warn('⚠️ Nenhuma empresa encontrada com o domínio:', dominio);
        setCarregando(false);
        return;
      }

      const empresaData = empresas[0];
      setEmpresa(empresaData);
      console.log('✅ Empresa encontrada:', empresaData);

      const empresaId = empresaData.id;

      const { data: info, error: erroInfo } = await supabase
        .from('informacoes_empresa')
        .select('*')
        .eq('empresa_id', empresaId);

      if (erroInfo) {
        console.warn('⚠️ Erro ao buscar informações da empresa:', erroInfo);
      }

      const infoMap: Record<string, string> = {};

      info?.forEach((item) => {
        // Junta valor + descrição, se ambas existirem
        const valor = item.valor?.trim() || '';
        const descricao = item.descricao?.trim() || '';
        infoMap[item.chave] = descricao ? `${valor} - ${descricao}` : valor;
      });

      setInformacoes(infoMap);

      const { data: atendentes } = await supabase
        .from('atendentes')
        .select('*')
        .eq('empresa_id', empresaId);

      if (atendentes && atendentes.length > 0) {
        const aleatorio = atendentes[Math.floor(Math.random() * atendentes.length)];
        setAtendente(aleatorio);
      }

      setCarregando(false);
    } catch (erro) {
      console.error('❌ Erro inesperado ao carregar dados:', erro);
      setCarregando(false);
    }
  };

  return (
    <EmpresaContext.Provider value={{ empresa, informacoes, atendente, carregando }}>
      {children}
    </EmpresaContext.Provider>
  );
};
