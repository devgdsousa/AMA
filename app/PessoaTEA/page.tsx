// app/cadastros/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/app/utils/supabase/client';
import { SearchInput } from '@/app/components/ui/search';
import { Footer } from '@/app/components/ui/footer';

type Cadastro = {
  id: number;
  nome: string;
  foto: string | null;
  data_nascimento: string | null;
  responsaveis: string | null;
  cpf: string | null;
  contatos: string | null;
  diagnostico: string | null;
  cid: string | null;
  tratamentos: string | null;
  medicacoes: string | null;
  local_atendimento: string | null;
  renda_bruta_familiar: string | null;
  pessoas_residencia: string | null;
  casa_situacao: string | null;
  recebe_beneficio: string | null;
  instituicao_ensino: string | null;
  endereco_escola: string | null;
  nivel_escolaridade: string | null;
  acompanhamento_especializado: string | null;
  observacoes: string | null;
};

export default function ListaPerfisPage() {
  const [lista, setLista] = useState<Cadastro[]>([]);
  const [selecionado, setSelecionado] = useState<Cadastro | null>(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarCadastros() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('cadastros')
          .select('*')
          .order('nome', { ascending: true });

        if (error) {
          setErro('Não foi possível carregar a lista de cadastros.');
        } else if (data) {
          setLista(data as Cadastro[]);
          setSelecionado((data as Cadastro[])[0] ?? null);
        }
      } catch {
        setErro('Erro inesperado ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    carregarCadastros();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(p => p.nome.toLowerCase().includes(termo));
  }, [busca, lista]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <span className="animate-pulse text-gray-500 text-lg">
          Carregando cadastros...
        </span>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
          Pessoas com TEA cadastradas
        </h1>

        {erro && (
          <p className="mb-4 text-sm text-red-600 font-medium">{erro}</p>
        )}

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          {/* Coluna esquerda: lista + busca */}
          <aside className="md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/80">
            <div className="p-4 border-b border-slate-200">
              <SearchInput
                placeholder="Buscar por nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                variant="outline"
                sizeVariant="sm"
              />
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {filtrados.length === 0 && (
                <p className="p-4 text-sm text-slate-500">
                  Nenhuma pessoa encontrada com esse nome.
                </p>
              )}

              <ul className="divide-y divide-slate-200">
                {filtrados.map(p => (
                  <li
                    key={p.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      selecionado?.id === p.id
                        ? 'bg-emerald-50 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-100'
                    }`}
                    onClick={() => setSelecionado(p)}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-emerald-100 shrink-0">
                      {p.foto ? (
                        <Image
                          src={p.foto}
                          alt={p.nome}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-emerald-700 font-semibold">
                          {p.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {p.nome}
                      </p>
                      {p.diagnostico && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {p.diagnostico}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Coluna direita: perfil detalhado */}
          <section className="md:w-2/3 p-6 md:p-8">
            {!selecionado ? (
              <p className="text-sm text-slate-500">
                Selecione uma pessoa na lista ao lado para visualizar os detalhes.
              </p>
            ) : (
              <PerfilDetalhe paciente={selecionado} />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* Componentes auxiliares */

function PerfilDetalhe({ paciente }: { paciente: Cadastro }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-emerald-900/20">
          {paciente.foto ? (
            <Image
              src={paciente.foto}
              alt={paciente.nome}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-100 text-sm text-center px-3">
              Sem foto cadastrada
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {paciente.nome}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            CPF: <span className="font-medium">{paciente.cpf}</span>
          </p>
          {paciente.responsaveis && (
            <p className="text-sm text-slate-600">
              Responsáveis:{' '}
              <span className="font-medium">{paciente.responsaveis}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <SectionTitle>Dados pessoais</SectionTitle>
          <Field label="Data de nascimento" value={paciente.data_nascimento} />
          <Field label="Contatos" value={paciente.contatos} />
          <Field label="Pessoas na residência" value={paciente.pessoas_residencia} />
          <Field label="Situação da casa" value={paciente.casa_situacao} />
          <Field label="Recebe benefício" value={paciente.recebe_beneficio} />
        </div>

        <div className="space-y-3">
          <SectionTitle>Informações clínicas</SectionTitle>
          <Field label="Diagnóstico" value={paciente.diagnostico} />
          <Field label="CID" value={paciente.cid} />
          <Field label="Tratamentos" value={paciente.tratamentos} />
          <Field label="Medicações" value={paciente.medicacoes} />
          <Field label="Local de atendimento" value={paciente.local_atendimento} />
        </div>

        <div className="space-y-3 md:col-span-2">
          <SectionTitle>Situação socioeconômica e escolar</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Renda bruta familiar"
              value={paciente.renda_bruta_familiar}
            />
            <Field
              label="Instituição de ensino"
              value={paciente.instituicao_ensino}
            />
            <Field
              label="Endereço da escola"
              value={paciente.endereco_escola}
            />
            <Field
              label="Nível de escolaridade"
              value={paciente.nivel_escolaridade}
            />
            <Field
              label="Acompanhamento especializado"
              value={paciente.acompanhamento_especializado}
            />
          </div>
        </div>

        {paciente.observacoes && (
          <div className="md:col-span-2">
            <SectionTitle>Observações</SectionTitle>
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
              {paciente.observacoes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </h3>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}
