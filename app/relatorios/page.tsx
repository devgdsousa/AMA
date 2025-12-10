'use client';

import { useState } from 'react';
import { Navbar } from '@/app/components/ui/navbar';
import { Footer } from '@/app/components/ui/footer';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { SearchInput } from '@/app/components/ui/search';
import { useRelatorios } from '@/app/relatorios/action';

export default function RelatoriosPage() {
  const {
    loading,
    error,
    filtrados,
    totalFiltrados,
    consultas,
    busca,
    setBusca,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    limparFiltros,
  } = useRelatorios();

  // filtros independentes para consultas
  const [buscaConsultas, setBuscaConsultas] = useState('');
  const [dataInicioConsultas, setDataInicioConsultas] = useState('');
  const [dataFimConsultas, setDataFimConsultas] = useState('');
  const [consultaSelecionada, setConsultaSelecionada] =
    useState<(typeof consultas)[number] | null>(null);

  const consultasFiltradas = consultas.filter(c => {
    const termo = buscaConsultas.trim().toLowerCase();
    const data = new Date(c.data_consulta);
    const inicio = dataInicioConsultas
      ? new Date(dataInicioConsultas)
      : null;
    const fim = dataFimConsultas ? new Date(dataFimConsultas) : null;

    const texto =
      (c.paciente_nome || '') +
      ' ' +
      (c.paciente_cpf || '') +
      ' ' +
      (c.operador_nome || '') +
      ' ' +
      (c.operador_email || '');

    const bateBusca = termo
      ? texto.toLowerCase().includes(termo)
      : true;
    const bateInicio = inicio ? data >= inicio : true;
    const bateFim = fim ? data <= fim : true;

    return bateBusca && bateInicio && bateFim;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e6]">
        <span className="animate-pulse text-gray-500 text-lg">
          Carregando relatórios...
        </span>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e6]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-6">
        {/* Cabeçalho da página: cadastros */}
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Relatórios de cadastros
          </h1>
          <p className="text-sm text-slate-600">
            Consulte quando um cadastro foi criado, quando foi atualizado e quem
            realizou o registro.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filtros – cadastros */}
        <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-4 md:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por nome ou usuário..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                variant="outline"
                sizeVariant="sm"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-700 mb-1">
                  Data inicial
                </label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-700 mb-1">
                  Data final
                </label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Histórico de cadastros */}
        <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-4 md:p-5 flex-1 flex flex-col">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Histórico de cadastros
            </h2>
            <p className="text-xs text-slate-500">
              {totalFiltrados} registro(s) encontrado(s).
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70 flex-1 flex flex-col">
            {filtrados.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                Nenhum cadastro encontrado para os filtros atuais.
              </p>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="text-left font-semibold px-3 py-2">
                        Cadastro
                      </th>
                      <th className="text-left font-semibold px-3 py-2">
                        Criado em
                      </th>
                      <th className="text-left font-semibold px-3 py-2">
                        Última atualização
                      </th>
                      <th className="text-left font-semibold px-3 py-2">
                        Criado por
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(reg => {
                      const criadoEm = new Date(reg.created_at);
                      const atualizadoEm = reg.updated_at
                        ? new Date(reg.updated_at)
                        : null;

                      return (
                        <tr
                          key={reg.id}
                          className="border-b border-slate-200/70 hover:bg-white"
                        >
                          <td className="px-3 py-2 align-top">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">
                                {reg.nome || `Cadastro #${reg.id}`}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                ID: {reg.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <span className="block text-slate-800">
                              {criadoEm.toLocaleDateString('pt-BR')}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {criadoEm.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top">
                            {atualizadoEm ? (
                              <>
                                <span className="block text-slate-800">
                                  {atualizadoEm.toLocaleDateString('pt-BR')}
                                </span>
                                <span className="block text-[11px] text-slate-500">
                                  {atualizadoEm.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                Nunca atualizado
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="flex flex-col">
                              <span className="text-slate-800">
                                {reg.created_by_name ||
                                  reg.created_by_email ||
                                  'Desconhecido'}
                              </span>
                              {reg.created_by_email && (
                                <span className="text-[11px] text-slate-500">
                                  {reg.created_by_email}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Histórico de consultas – com filtros próprios */}
        <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-4 md:p-5 flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Histórico de consultas
              </h2>
              <p className="text-xs text-slate-500">
                {consultasFiltradas.length} consulta(s) registrada(s).
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="md:w-64">
                <SearchInput
                  placeholder="Buscar por paciente ou profissional..."
                  value={buscaConsultas}
                  onChange={e => setBuscaConsultas(e.target.value)}
                  variant="outline"
                  sizeVariant="sm"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-700 mb-1">
                    Data inicial
                  </label>
                  <Input
                    type="date"
                    value={dataInicioConsultas}
                    onChange={e => setDataInicioConsultas(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-700 mb-1">
                    Data final
                  </label>
                  <Input
                    type="date"
                    value={dataFimConsultas}
                    onChange={e => setDataFimConsultas(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70 flex-1 flex flex-col">
            {consultasFiltradas.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                Nenhuma consulta encontrada para os filtros atuais.
              </p>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="text-left font-semibold px-3 py-2">
                        Paciente
                      </th>
                      <th className="text-left font-semibold px-3 py-2">
                        Data da consulta
                      </th>
                      <th className="text-left font-semibold px-3 py-2">
                        Profissional
                      </th>
                      <th className="text-left font-semibold px-3 py-2">
                        Resumo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultasFiltradas.map(cons => {
                      const data = new Date(cons.data_consulta);
                      return (
                        <tr
                          key={cons.id}
                          className="border-b border-slate-200/70 hover:bg-white cursor-pointer"
                          onClick={() => setConsultaSelecionada(cons)}
                        >
                          <td className="px-3 py-2 align-top">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">
                                {cons.paciente_nome}
                              </span>
                              {cons.paciente_cpf && (
                                <span className="text-[11px] text-slate-500">
                                  CPF: {cons.paciente_cpf}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <span className="block text-slate-800">
                              {data.toLocaleDateString('pt-BR')}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {data.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="flex flex-col">
                              <span className="text-slate-800">
                                {cons.operador_nome ||
                                  cons.operador_email ||
                                  'Desconhecido'}
                              </span>
                              {cons.operador_email && (
                                <span className="text-[11px] text-slate-500">
                                  {cons.operador_email}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <span className="line-clamp-2 text-slate-700">
                              {cons.resumo || 'Sem resumo cadastrado.'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Popup detalhes da consulta */}
      {consultaSelecionada && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-5 md:p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Detalhes da consulta
                </h3>
                <p className="text-xs text-slate-500">
                  ID #{consultaSelecionada.id}
                </p>
              </div>
              <button
                className="text-slate-500 hover:text-slate-700 text-sm"
                onClick={() => setConsultaSelecionada(null)}
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-800">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Paciente
                </p>
                <p>{consultaSelecionada.paciente_nome}</p>
                {consultaSelecionada.paciente_cpf && (
                  <p className="text-xs text-slate-500">
                    CPF: {consultaSelecionada.paciente_cpf}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Profissional
                </p>
                <p>
                  {consultaSelecionada.operador_nome ||
                    consultaSelecionada.operador_email ||
                    'Desconhecido'}
                </p>
                {consultaSelecionada.operador_email && (
                  <p className="text-xs text-slate-500">
                    {consultaSelecionada.operador_email}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Data e horário
                </p>
                <p>
                  {new Date(
                    consultaSelecionada.data_consulta,
                  ).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              {consultaSelecionada.titulo && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Título
                  </p>
                  <p>{consultaSelecionada.titulo}</p>
                </div>
              )}

              {consultaSelecionada.resumo && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Resumo
                  </p>
                  <p className="whitespace-pre-line">
                    {consultaSelecionada.resumo}
                  </p>
                </div>
              )}

              {consultaSelecionada.observacoes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Observações
                  </p>
                  <p className="whitespace-pre-line">
                    {consultaSelecionada.observacoes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConsultaSelecionada(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
