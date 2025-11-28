'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  initialState,
  fileTypes,
  FileField,
  PacienteFields,
  cadastrarPaciente,
} from '@/app/cadastros/action';
import { Footer } from '@/app/components/ui/footer';

export default function CadastroPacientePage() {
  const [fields, setFields] = useState<PacienteFields>(initialState);
  const [files, setFiles] = useState<Partial<Record<FileField, File>>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, files: inputFiles } = e.target;
    if (!['foto', 'documento', 'documento_responsaveis', 'laudo'].includes(name)) return;
    const file = inputFiles?.[0];
    if (file && fileTypes[name as FileField]?.includes(file.type)) {
      setFiles(prev => ({ ...prev, [name]: file }));
    } else {
      setError('Tipo de arquivo inválido!');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await cadastrarPaciente(fields, files);
      setSuccess(true);
      setFields(initialState);
      setFiles({});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e6]">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
          Registro de Pessoa com TEA
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 px-6 py-6 md:px-8 md:py-8 space-y-8"
        >
          {/* Seção: Dados pessoais */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Dados pessoais
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-1">
                  Nome completo <span className="text-red-600">*</span>
                </label>
                <input
                  name="nome"
                  value={fields.nome}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Data de nascimento <span className="text-red-600">*</span>
                </label>
                <input
                  name="data_nascimento"
                  value={fields.data_nascimento}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="date"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Responsáveis <span className="text-red-600">*</span>
                </label>
                <input
                  name="responsaveis"
                  value={fields.responsaveis}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  CPF <span className="text-red-600">*</span>
                </label>
                <input
                  name="cpf"
                  value={fields.cpf}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Contatos <span className="text-red-600">*</span>
                </label>
                <input
                  name="contatos"
                  value={fields.contatos}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Seção: Informações clínicas */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Informações clínicas
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Diagnóstico <span className="text-red-600">*</span>
                </label>
                <input
                  name="diagnostico"
                  value={fields.diagnostico}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  CID <span className="text-red-600">*</span>
                </label>
                <input
                  name="cid"
                  value={fields.cid}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-1">
                  Tratamentos <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="tratamentos"
                  value={fields.tratamentos}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-1">
                  Medicações <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="medicacoes"
                  value={fields.medicacoes}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-1">
                  Local de atendimento <span className="text-red-600">*</span>
                </label>
                <input
                  name="local_atendimento"
                  value={fields.local_atendimento}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Seção: Situação socioeconômica e escolar */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Situação socioeconômica e escolar
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Renda bruta familiar <span className="text-red-600">*</span>
                </label>
                <input
                  name="renda_bruta_familiar"
                  value={fields.renda_bruta_familiar}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Pessoas na residência <span className="text-red-600">*</span>
                </label>
                <input
                  name="pessoas_residencia"
                  value={fields.pessoas_residencia}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Situação da casa <span className="text-red-600">*</span>
                </label>
                <input
                  name="casa_situacao"
                  value={fields.casa_situacao}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Recebe benefício? <span className="text-red-600">*</span>
                </label>
                <input
                  name="recebe_beneficio"
                  value={fields.recebe_beneficio}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Instituição de ensino <span className="text-red-600">*</span>
                </label>
                <input
                  name="instituicao_ensino"
                  value={fields.instituicao_ensino}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Endereço da escola <span className="text-red-600">*</span>
                </label>
                <input
                  name="endereco_escola"
                  value={fields.endereco_escola}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Nível de escolaridade <span className="text-red-600">*</span>
                </label>
                <input
                  name="nivel_escolaridade"
                  value={fields.nivel_escolaridade}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Acompanhamento especializado <span className="text-red-600">*</span>
                </label>
                <input
                  name="acompanhamento_especializado"
                  value={fields.acompanhamento_especializado}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-1">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={fields.observacoes}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Seção: Documentos / uploads */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Documentos
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(['foto', 'documento', 'documento_responsaveis', 'laudo'] as FileField[]).map(
                field => (
                  <div key={field}>
                    <label className="block text-sm text-slate-700 mb-1 capitalize">
                      {field.replace(/_/g, ' ')}{' '}
                      <span className="text-xs text-gray-500">(jpeg, png, pdf)</span>
                    </label>
                    <input
                      name={field}
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf"
                      onChange={handleFileChange}
                      className="w-full border px-3 py-2 rounded-md bg-white"
                    />
                  </div>
                )
              )}
            </div>
          </section>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          {success && (
            <p className="text-emerald-700 text-sm font-medium">
              Registro realizado com sucesso!
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-emerald-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
