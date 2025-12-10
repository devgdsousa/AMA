// app/editar/[id]/page.tsx
'use client';


import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  initialState,
  fileTypes,
  FileField,
  PacienteFields,
  uploadFileToStorage,
} from '@/app/cadastros/action';
import { Footer } from '@/app/components/ui/footer';
import { createClient } from '@/app/utils/supabase/client';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Navbar } from '@/app/components/ui/navbar';


type PacienteComArquivos = PacienteFields & {
  foto: string | null;
  documento: string | null;
  documento_responsaveis: string | null;
  laudo: string | null;
};


export default function EditarPacientePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;


  const [fields, setFields] = useState<PacienteFields>(initialState);
  const [files, setFiles] = useState<Partial<Record<FileField, File>>>({});
  const [currentPaths, setCurrentPaths] = useState<
    Partial<Record<FileField, string | null>>
  >({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  // Carrega dados existentes
  useEffect(() => {
    if (!id) {
      setError('ID do cadastro não foi informado na URL.');
      setLoading(false);
      return;
    }


    async function loadPaciente() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', Number(id))
          .single();


        if (error || !data) {
          setError('Não foi possível carregar os dados do cadastro.');
          return;
        }


        const p = data as PacienteComArquivos;


        setFields({
          nome: p.nome,
          data_nascimento: p.data_nascimento ?? '',
          responsaveis: p.responsaveis ?? '',
          cpf: p.cpf ?? '',
          contatos: p.contatos ?? '',
          diagnostico: p.diagnostico ?? '',
          cid: p.cid ?? '',
          tratamentos: p.tratamentos ?? '',
          medicacoes: p.medicacoes ?? '',
          local_atendimento: p.local_atendimento ?? '',
          renda_bruta_familiar: p.renda_bruta_familiar ?? '',
          pessoas_residencia: p.pessoas_residencia ?? '',
          casa_situacao: p.casa_situacao ?? '',
          recebe_beneficio: p.recebe_beneficio ?? '',
          instituicao_ensino: p.instituicao_ensino ?? '',
          endereco_escola: p.endereco_escola ?? '',
          nivel_escolaridade: p.nivel_escolaridade ?? '',
          acompanhamento_especializado: p.acompanhamento_especializado ?? '',
          observacoes: p.observacoes ?? '',
        });


        setCurrentPaths({
          foto: p.foto,
          documento: p.documento,
          documento_responsaveis: p.documento_responsaveis,
          laudo: p.laudo,
        });
      } catch {
        setError('Erro inesperado ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }


    loadPaciente();
  }, [id]);


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }


  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, files: InputFiles } = e.target;
    if (!['foto', 'documento', 'documento_responsaveis', 'laudo'].includes(name))
      return;


    const file = InputFiles?.[0];
    if (file && fileTypes[name as FileField]?.includes(file.type)) {
      setFiles(prev => ({ ...prev, [name]: file }));
    } else {
      setError('Tipo de arquivo inválido!');
    }
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) {
      setError('ID do cadastro não foi informado na URL.');
      return;
    }


    setError('');
    setSuccess(false);
    setSaving(true);


    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError || !user) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }


      const buckets: Record<FileField, string> = {
        foto: 'foto',
        documento: 'documento',
        documento_responsaveis: 'documento_responsaveis',
        laudo: 'laudo',
      };


      const updatedFiles: Partial<Record<FileField, string>> = {};


      // Upload apenas dos arquivos que foram trocados
      for (const key of Object.keys(files) as FileField[]) {
        const file = files[key];
        if (file) {
          const path = await uploadFileToStorage(file, buckets[key], user.id);
          updatedFiles[key] = path;
        }
      }


      const payload = {
        ...fields,
        ...currentPaths,  // mantém paths antigos
        ...updatedFiles,  // sobrescreve com os novos se existirem
      };


      const { error: dbError } = await supabase
        .from('cadastros')
        .update(payload)
        .eq('id', Number(id));


      if (dbError) {
        throw new Error(dbError.message || 'Erro ao atualizar cadastro.');
      }


      setSuccess(true);
      window.location.href = '/PessoaTEA';
    } catch (err: any) {
      setError(err.message ?? 'Erro ao atualizar cadastro.');
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e6]">
        <span className="animate-pulse text-gray-500 text-lg">
          Carregando dados do cadastro...
        </span>
      </main>
    );
  }

  
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e6]">
      <Navbar/>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
          Atualizar cadastro de Pessoa com TEA
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
                <Input
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
                <Input
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
                <Input
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
                <Input
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
                <Input
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
                <Input
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
                <Input
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
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700 mb-1">
                  Local de atendimento <span className="text-red-600">*</span>
                </label>
                <Input
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
                <Input
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
                <Input
                  name="pessoas_residencia"
                  value={fields.pessoas_residencia}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus;border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Situação da casa <span className="text-red-600">*</span>
                </label>
                <Input
                  name="casa_situacao"
                  value={fields.casa_situacao}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Recebe benefício? <span className="text-red-600">*</span>
                </label>
                <Input
                  name="recebe_beneficio"
                  value={fields.recebe_beneficio}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Instituição de ensino <span className="text-red-600">*</span>
                </label>
                <Input
                  name="instituicao_ensino"
                  value={fields.instituicao_ensino}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus;border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Endereço da escola <span className="text-red-600">*</span>
                </label>
                <Input
                  name="endereco_escola"
                  value={fields.endereco_escola}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus;border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Nível de escolaridade <span className="text-red-600">*</span>
                </label>
                <Input
                  name="nivel_escolaridade"
                  value={fields.nivel_escolaridade}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus;border-emerald-500"
                  type="text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Acompanhamento especializado <span className="text-red-600">*</span>
                </label>
                <Input
                  name="acompanhamento_especializado"
                  value={fields.acompanhamento_especializado}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus;border-emerald-500"
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
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus;border-emerald-500"
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
                    <Input
                      name={field}
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf"
                      onChange={handleFileChange}
                      className="w-full border px-3 py-2 rounded-md bg-white"
                    />
                    {currentPaths[field] && (
                      <p className="mt-1 text-xs text-slate-500">
                        Arquivo já cadastrado. Deixe em branco para manter o atual.
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </section>


          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          {success && (
            <p className="text-emerald-700 text-sm font-medium">
              Cadastro atualizado com sucesso!
            </p>
          )}


          <div className="flex justify-end gap-3">
            <Button
              variant="destructive"
              className="px-4 py-2 rounded-md border border-slate-300 text-white hover:bg-red-200"
              onClick={() => (window.location.href = '/PessoaTEA')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-emerald-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </main>


      <Footer />
    </div>
  );
} 