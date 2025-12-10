import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';

export type Cadastro = {
  id: number;
  nome: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  created_by_name: string | null;
  created_by_email: string | null;
};

export type Consulta = {
  id: number;
  data_consulta: string;
  titulo: string | null;
  resumo: string | null;
  observacoes: string | null;
  paciente_id: number;
  paciente_nome: string;
  paciente_cpf: string | null;
  operador_nome: string | null;
  operador_email: string | null;
};

export function useRelatorios() {
  const [registros, setRegistros] = useState<Cadastro[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filtros APENAS para cadastros
  const [busca, setBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError('');
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError('Sessão expirada. Faça login novamente.');
          return;
        }

        // Relatórios de cadastros (igual ao seu)
        const { data: cadData, error: cadError } = await supabase
          .from('cadastros')
          .select(
            `
            id,
            nome,
            created_at,
            updated_at,
            user_id,
            user_login (
              nome,
              email
            )
          `,
          )
          .order('created_at', { ascending: false });

        if (cadError) {
          console.error(cadError);
          setError('Não foi possível carregar os relatórios de cadastro.');
          return;
        }

        const normalizados: Cadastro[] = (cadData || []).map((row: any) => ({
          id: row.id,
          nome: row.nome,
          created_at: row.created_at,
          updated_at: row.updated_at,
          user_id: row.user_id,
          created_by_name: row.user_login?.nome ?? null,
          created_by_email: row.user_login?.email ?? null,
        }));

        setRegistros(normalizados);

        // Relatórios de consultas (sem usar os filtros de cadastros)
        const { data: consData, error: consError } = await supabase
          .from('consultas')
          .select(
            `
            id,
            data_consulta,
            titulo,
            resumo,
            observacoes,
            paciente_id,
            cadastros:paciente_id (
              id,
              nome,
              cpf
            ),
            user_login:operador_id (
              nome,
              email
            )
          `,
          )
          .order('data_consulta', { ascending: false });

        if (consError) {
          console.error(consError);
          setError('Não foi possível carregar os relatórios de consulta.');
          return;
        }

        const consultasNorm: Consulta[] = (consData || []).map((row: any) => ({
          id: row.id,
          data_consulta: row.data_consulta,
          titulo: row.titulo,
          resumo: row.resumo,
          observacoes: row.observacoes,
          paciente_id: row.paciente_id,
          paciente_nome: row.cadastros?.nome ?? 'Desconhecido',
          paciente_cpf: row.cadastros?.cpf ?? null,
          operador_nome: row.user_login?.nome ?? null,
          operador_email: row.user_login?.email ?? null,
        }));

        setConsultas(consultasNorm);
      } catch (e) {
        console.error(e);
        setError('Erro inesperado ao carregar os relatórios.');
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  // filtro só dos cadastros
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;

    return registros.filter(reg => {
      const texto =
        (reg.nome || '') +
        ' ' +
        (reg.created_by_name || '') +
        ' ' +
        (reg.created_by_email || '');
      const bateBusca = termo
        ? texto.toLowerCase().includes(termo)
        : true;

      const createdAt = new Date(reg.created_at);
      const bateInicio = inicio ? createdAt >= inicio : true;
      const bateFim = fim ? createdAt <= fim : true;

      return bateBusca && bateInicio && bateFim;
    });
  }, [registros, busca, dataInicio, dataFim]);

  const limparFiltros = () => {
    setBusca('');
    setDataInicio('');
    setDataFim('');
  };

  return {
    loading,
    error,
    filtrados,
    totalFiltrados: filtrados.length,
    consultas,
    busca,
    setBusca,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    limparFiltros,
  };
}
