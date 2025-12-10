'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import { Navbar } from '@/app/components/ui/navbar';
import { Footer } from '@/app/components/ui/footer';
import { SearchInput } from '@/app/components/ui/search';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

type Paciente = {
  id: number;
  nome: string;
  cpf: string;
  responsaveis: string;
};

type ConsultaFields = {
  titulo: string;
  resumo: string;
  observacoes: string;
};

const initialConsulta: ConsultaFields = {
  titulo: '',
  resumo: '',
  observacoes: '',
};

export default function ConsultasPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState<Paciente | null>(null);

  const [consulta, setConsulta] = useState<ConsultaFields>(initialConsulta);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError('');
      try {
        const supabase = createClient();

        // garante usuário logado
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError('Sessão expirada. Faça login novamente.');
          return;
        }

        const { data, error } = await supabase
          .from('cadastros')
          .select('id, nome, cpf, responsaveis')
          .order('nome', { ascending: true });

        if (error) {
          setError('Não foi possível carregar a lista de pacientes.');
          return;
        }

        setPacientes((data || []) as Paciente[]);
        setSelecionado((data && data[0]) || null);
      } catch {
        setError('Erro inesperado ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pacientes;
    return pacientes.filter(p =>
      (p.nome + ' ' + p.cpf).toLowerCase().includes(termo),
    );
  }, [busca, pacientes]);

  function handleConsultaChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setConsulta(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selecionado) {
      setError('Selecione um paciente para registrar a consulta.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }

      const { error } = await supabase.from('consultas').insert({
        paciente_id: selecionado.id,
        operador_id: user.id,
        titulo: consulta.titulo || null,
        resumo: consulta.resumo || null,
        observacoes: consulta.observacoes || null,
      });

      if (error) {
        setError('Não foi possível salvar a consulta.');
        return;
      }

      setSuccess('Consulta registrada com sucesso!');
      setConsulta(initialConsulta);
    } catch {
      setError('Erro inesperado ao salvar a consulta.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e6]">
        <span className="animate-pulse text-gray-500 text-lg">
          Carregando informações...
        </span>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e6]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Consulta
          </h1>
          <p className="text-sm text-slate-600">
            Selecione uma pessoa cadastrada e registre os dados da consulta
            realizada.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          {/* Coluna esquerda: busca + lista de pacientes */}
          <aside className="md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/80">
            <div className="p-4 border-b border-slate-200">
              <SearchInput
                placeholder="Buscar por nome ou CPF..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                variant="outline"
                sizeVariant="sm"
              />
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {filtrados.length === 0 && (
                <p className="p-4 text-sm text-slate-500">
                  Nenhuma pessoa encontrada.
                </p>
              )}

              <ul className="divide-y divide-slate-200">
                {filtrados.map(p => (
                  <li
                    key={p.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      selecionado?.id === p.id
                        ? 'bg-emerald-50 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-100'
                    }`}
                    onClick={() => setSelecionado(p)}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {p.nome}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      CPF: {p.cpf}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Responsáveis: {p.responsaveis}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Coluna direita: formulário da consulta */}
          <section className="md:w-2/3 p-6 md:p-8 flex flex-col gap-4">
            {!selecionado ? (
              <p className="text-sm text-slate-500">
                Selecione um pessoa na lista ao lado para iniciar o registro
                de consulta.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pessoa selecionada
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {selecionado.nome}
                  </p>
                  <p className="text-xs text-slate-500">
                    CPF: {selecionado.cpf} • Responsáveis: {selecionado.responsaveis}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">
                      Título da consulta
                    </label>
                    <Input
                      name="titulo"
                      value={consulta.titulo}
                      onChange={handleConsultaChange}
                      placeholder="Ex.: Avaliação inicial, Retorno, Encaminhamento..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-1">
                      Resumo da consulta
                    </label>
                    <Textarea
                      name="resumo"
                      value={consulta.resumo}
                      onChange={handleConsultaChange}
                      rows={4}
                      placeholder="Anote os pontos principais discutidos na consulta."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-1">
                      Observações adicionais
                    </label>
                    <Textarea
                      name="observacoes"
                      value={consulta.observacoes}
                      onChange={handleConsultaChange}
                      rows={4}
                      placeholder="Informações complementares, próximos passos, encaminhamentos, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200 mt-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConsulta(initialConsulta)}
                  >
                    Limpar campos
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar consulta'}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
