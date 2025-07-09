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
    const script = document.querySelector('script[data-dominio]');
    const dominio = script?.getAttribute('data-dominio');

    if (!dominio) {
      console.error('Domínio não encontrado no script embed.');
      setCarregando(false);
      return;
    }

    (async () => {
      // 1. Buscar dados da empresa pelo domínio
      const { data: empresas, error: erroEmpresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('dominio', dominio)
        .limit(1);

      if (erroEmpresa || !empresas || empresas.length === 0) {
        console.error('Erro ao buscar empresa:', erroEmpresa);
        setCarregando(false);
        return;
      }

      const empresaData = empresas[0];
      setEmpresa(empresaData);

      // 2. Buscar informacoes_empresa
      const { data: info } = await supabase
        .from('informacoes_empresa')
        .select('*')
        .eq('empresa_id', empresaData.id);

      const infoMap: Record<string, string> = {};
      info?.forEach((item) => {
        infoMap[item.chave] = item.valor;
      });
      setInformacoes(infoMap);

      // 3. Buscar atendentes
      const { data: atendentes } = await supabase
        .from('atendentes')
        .select('*')
        .eq('empresa_id', empresaData.id);

      if (atendentes && atendentes.length > 0) {
        const aleatorio = atendentes[Math.floor(Math.random() * atendentes.length)];
        setAtendente(aleatorio);
      }

      setCarregando(false);
    })();
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresa, informacoes, atendente, carregando }}>
      {children}
    </EmpresaContext.Provider>
  );
};
