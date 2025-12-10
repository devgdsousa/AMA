'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import { SearchInput } from '@/app/components/ui/search';
import { Footer } from '@/app/components/ui/footer';
import { Button } from '@/app/components/ui/button';
import { Navbar } from '../components/ui/navbar';
import { useReactToPrint } from 'react-to-print';

// Tipos base
type Cadastro = {
  id: number;
  nome: string;
  foto: string | null;
  documento: string | null;
  documento_responsaveis: string | null;
  laudo: string | null;
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

type CadastroComUrl = Cadastro & {
  fotoUrl?: string | null;
  documentoUrl?: string | null;
  documentoResponsaveisUrl?: string | null;
  laudoUrl?: string | null;
};

export default function ListaPerfisPage() {
  const [lista, setLista] = useState<CadastroComUrl[]>([]);
  const [selecionado, setSelecionado] = useState<CadastroComUrl | null>(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  // Ref do conteúdo que será impresso (currículo)
  const printRef = useRef<HTMLDivElement | null>(null);

  // Hook do react-to-print (v3) usando contentRef
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

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
          return;
        }
        if (!data) {
          setLista([]);
          setSelecionado(null);
          return;
        }

        const baseLista = data as Cadastro[];
        const listaComUrls: CadastroComUrl[] = [];

        for (const item of baseLista) {
          let fotoUrl: string | null = null;
          let documentoUrl: string | null = null;
          let documentoResponsaveisUrl: string | null = null;
          let laudoUrl: string | null = null;

          if (item.foto) {
            const { data: signed, error: signedError } =
              await supabase.storage
                .from('foto')
                .createSignedUrl(item.foto, 60 * 60);
            if (!signedError) fotoUrl = signed?.signedUrl ?? null;
          }

          if (item.documento) {
            const { data: signed, error: signedError } =
              await supabase.storage
                .from('documento')
                .createSignedUrl(item.documento, 60 * 60);
            if (!signedError) documentoUrl = signed?.signedUrl ?? null;
          }

          if (item.documento_responsaveis) {
            const { data: signed, error: signedError } =
              await supabase.storage
                .from('documento_responsaveis')
                .createSignedUrl(item.documento_responsaveis, 60 * 60);
            if (!signedError)
              documentoResponsaveisUrl = signed?.signedUrl ?? null;
          }

          if (item.laudo) {
            const { data: signed, error: signedError } =
              await supabase.storage
                .from('laudo')
                .createSignedUrl(item.laudo, 60 * 60);
            if (!signedError) laudoUrl = signed?.signedUrl ?? null;
          }

          listaComUrls.push({
            ...item,
            fotoUrl,
            documentoUrl,
            documentoResponsaveisUrl,
            laudoUrl,
          });
        }

        setLista(listaComUrls);
        setSelecionado(listaComUrls[0] ?? null);
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

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este cadastro?')) return;
    setActionLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('cadastros').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir cadastro: ' + error.message);
        return;
      }
      const novaLista = lista.filter(p => p.id !== id);
      setLista(novaLista);
      setSelecionado(novaLista[0] ?? null);
    } finally {
      setActionLoading(false);
    }
  }

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
    <div className="min-h-screen flex flex-col bg-[#f5f0e6]">
      <Navbar/>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 md:py-10 no-print">
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
                      {p.fotoUrl ? (
                        <Image
                          src={p.fotoUrl}
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

          {/* Coluna direita: perfil detalhado + impressão */}
          <section className="md:w-2/3 p-6 md:p-8 flex flex-col gap-4">
            {!selecionado ? (
              <p className="text-sm text-slate-500">
                Selecione uma pessoa na lista ao lado para visualizar os
                detalhes.
              </p>
            ) : (
              <>
                <PerfilDetalhe paciente={selecionado} />

                {/* Conteúdo que será impresso (currículo) */}
                <div ref={printRef} className="hidden print:block">
                  <PerfilCurriculoPrint paciente={selecionado} />
                </div>

                <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-slate-200 mt-2">
                  <Button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    disabled={actionLoading}
                  >
                    Imprimir 
                  </Button>

                  <Button
                    onClick={() => router.push(`/editar/${selecionado.id}`)}
                    className="px-4 py-2 rounded-md text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
                    disabled={actionLoading}
                  >
                    Editar dados
                  </Button>
                  <Button
                    onClick={() => handleDelete(selecionado.id)}
                    className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    disabled={actionLoading}
                  >
                    Excluir cadastro
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer  />
    </div>
  );
}

/* Componentes auxiliares */

function PerfilDetalhe({ paciente }: { paciente: CadastroComUrl }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-emerald-900/20">
          {paciente.fotoUrl ? (
            <Image
              src={paciente.fotoUrl}
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
          {paciente.cpf && (
            <p className="text-sm text-slate-600 mt-1">
              CPF: <span className="font-medium">{paciente.cpf}</span>
            </p>
          )}
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
          <Field
            label="Pessoas na residência"
            value={paciente.pessoas_residencia}
          />
          <Field label="Situação da casa" value={paciente.casa_situacao} />
          <Field label="Recebe benefício" value={paciente.recebe_beneficio} />
        </div>

        <div className="space-y-3">
          <SectionTitle>Informações clínicas</SectionTitle>
          <Field label="Diagnóstico" value={paciente.diagnostico} />
          <Field label="CID" value={paciente.cid} />
          <Field label="Tratamentos" value={paciente.tratamentos} />
          <Field label="Medicações" value={paciente.medicacoes} />
          <Field
            label="Local de atendimento"
            value={paciente.local_atendimento}
          />
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

        <div className="space-y-3 md:col-span-2">
          <SectionTitle>Documentos</SectionTitle>
          <div className="flex flex-wrap gap-3 text-sm">
            {paciente.documentoUrl && (
              <a
                href={paciente.documentoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-300 text-slate-800 hover:bg-slate-100"
              >
                Documento da pessoa (PDF / imagem)
              </a>
            )}
            {paciente.documentoResponsaveisUrl && (
              <a
                href={paciente.documentoResponsaveisUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-300 text-slate-800 hover:bg-slate-100"
              >
                Documento dos responsáveis
              </a>
            )}
            {paciente.laudoUrl && (
              <a
                href={paciente.laudoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-300 text-slate-800 hover:bg-slate-100"
              >
                Laudo médico (PDF / imagem)
              </a>
            )}
            {!paciente.documentoUrl &&
              !paciente.documentoResponsaveisUrl &&
              !paciente.laudoUrl && (
                <p className="text-sm text-slate-500">
                  Nenhum documento enviado para este cadastro.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Currículo imprimível */

function PerfilCurriculoPrint({ paciente }: { paciente: CadastroComUrl }) {
  return (
    <div className="min-h-screen flex justify-center items-start bg-white p-8">
      <div className="w-full max-w-2xl text-slate-900 text-sm leading-relaxed">
        {/* Cabeçalho com foto e dados principais */}
        <div className="flex items-start gap-4 mb-6">
          {paciente.fotoUrl && (
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-slate-300">
              {/* na impressão, <img> simples evita problemas */}
              <img
                src={paciente.fotoUrl}
                alt={paciente.nome}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1">
              {paciente.nome}
            </h1>

            {paciente.cpf && (
              <p className="text-[13px]">
                <span className="font-semibold">CPF: </span>
                {paciente.cpf}
              </p>
            )}

            {paciente.contatos && (
              <p className="text-[13px]">
                <span className="font-semibold">Contato: </span>
                {paciente.contatos}
              </p>
            )}

            {paciente.instituicao_ensino && (
              <p className="text-[13px]">
                <span className="font-semibold">Instituição de ensino: </span>
                {paciente.instituicao_ensino}
              </p>
            )}

            {paciente.endereco_escola && (
              <p className="text-[13px]">
                <span className="font-semibold">Endereço: </span>
                {paciente.endereco_escola}
              </p>
            )}
          </div>
        </div>

        {/* Objetivo / Resumo clínico */}
        {(paciente.diagnostico || paciente.observacoes) && (
          <section className="mb-4">
            <h2 className="font-semibold text-[13px] uppercase tracking-wide mb-1">
              Observações / Resumo
            </h2>
            {paciente.diagnostico && (
              <p className="text-[13px] mb-1">
                <span className="font-semibold">Diagnóstico principal: </span>
                {paciente.diagnostico}
              </p>
            )}
            {paciente.observacoes && (
              <p className="text-[13px] whitespace-pre-line">
                {paciente.observacoes}
              </p>
            )}
          </section>
        )}

        {/* Dados pessoais */}
        <section className="mb-4">
          <h2 className="font-semibold text-[13px] uppercase tracking-wide mb-1">
            Dados pessoais
          </h2>
          <ul className="text-[13px] space-y-0.5">
            {paciente.data_nascimento && (
              <li>
                <span className="font-semibold">Data de nascimento: </span>
                {paciente.data_nascimento}
              </li>
            )}
            {paciente.responsaveis && (
              <li>
                <span className="font-semibold">Responsáveis: </span>
                {paciente.responsaveis}
              </li>
            )}
            {paciente.pessoas_residencia && (
              <li>
                <span className="font-semibold">Pessoas na residência: </span>
                {paciente.pessoas_residencia}
              </li>
            )}
            {paciente.casa_situacao && (
              <li>
                <span className="font-semibold">Situação da casa: </span>
                {paciente.casa_situacao}
              </li>
            )}
            {paciente.recebe_beneficio && (
              <li>
                <span className="font-semibold">Recebe benefício: </span>
                {paciente.recebe_beneficio}
              </li>
            )}
          </ul>
        </section>

        {/* Informações clínicas */}
        <section className="mb-4">
          <h2 className="font-semibold text-[13px] uppercase tracking-wide mb-1">
            Informações clínicas
          </h2>
          <ul className="text-[13px] space-y-0.5">
            {paciente.cid && (
              <li>
                <span className="font-semibold">CID: </span>
                {paciente.cid}
              </li>
            )}
            {paciente.tratamentos && (
              <li>
                <span className="font-semibold">Tratamentos: </span>
                {paciente.tratamentos}
              </li>
            )}
            {paciente.medicacoes && (
              <li>
                <span className="font-semibold">Medicações: </span>
                {paciente.medicacoes}
              </li>
            )}
            {paciente.local_atendimento && (
              <li>
                <span className="font-semibold">Local de atendimento: </span>
                {paciente.local_atendimento}
              </li>
            )}
          </ul>
        </section>

        {/* Situação socioeconômica e escolar */}
        <section className="mb-4">
          <h2 className="font-semibold text-[13px] uppercase tracking-wide mb-1">
            Situação socioeconômica e escolar
          </h2>
          <ul className="text-[13px] space-y-0.5">
            {paciente.renda_bruta_familiar && (
              <li>
                <span className="font-semibold">Renda bruta familiar: </span>
                {paciente.renda_bruta_familiar}
              </li>
            )}
            {paciente.nivel_escolaridade && (
              <li>
                <span className="font-semibold">Nível de escolaridade: </span>
                {paciente.nivel_escolaridade}
              </li>
            )}
            {paciente.acompanhamento_especializado && (
              <li>
                <span className="font-semibold">
                  Acompanhamento especializado:{' '}
                </span>
                {paciente.acompanhamento_especializado}
              </li>
            )}
          </ul>
        </section>

        {/* Rodapé simples se quiser data / assinatura */}
        <section className="mt-6 text-[12px] text-slate-500">
          <p>Gerado pelo sistema em {new Date().toLocaleDateString('pt-BR')}</p>
        </section>
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

function Field({ label, value }: { label: string | null; value: string | null }) {
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
