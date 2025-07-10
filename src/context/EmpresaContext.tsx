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
    let dominio = '';

    try {
      dominio = window.parent.location.hostname;
      console.log('🌐 Dominio capturado via parent:', dominio);
    } catch (e) {
      dominio = window.location.hostname;
      console.warn('⚠️ Fallback para self hostname:', dominio);
    }

    if (!dominio) {
      console.error('❌ Domínio não identificado.');
      setCarregando(false);
      return;
    }

    console.log('🔍 Buscando dados para o domínio:', dominio);

    (async () => {
      try {
        const { data: empresas, error: erroEmpresa } = await supabase
          .from('empresas')
          .select('*')
          .eq('dominio', dominio)
          .limit(1);

        if (erroEmpresa) {
          console.error('❌ Erro ao buscar empresa:', erroEmpresa);
          setCarregando(false);
          return;
        }

        if (!empresas || empresas.length === 0) {
          console.warn('⚠️ Nenhuma empresa encontrada para o domínio:', dominio);
          setCarregando(false);
          return;
        }

        const empresaData = empresas[0];
        setEmpresa(empresaData);
        console.log('✅ Empresa encontrada:', empresaData);

        const { data: info, error: erroInfo } = await supabase
          .from('informacoes_empresa')
          .select('*')
          .eq('empresa_id', empresaData.id);

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
          .eq('empresa_id', empresaData.id);

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
    })();
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresa, informacoes, atendente, carregando }}>
      {children}
    </EmpresaContext.Provider>
  );
};
