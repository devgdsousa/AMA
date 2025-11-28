'use client';

import { createClient } from '@/app/utils/supabase/client';

export type FileField = 'foto' | 'documento' | 'documento_responsaveis' | 'laudo';

export const fileTypes: Record<FileField, string[]> = {
  foto: ['image/jpeg', 'image/png'],
  documento: ['application/pdf', 'image/jpeg', 'image/png'],
  documento_responsaveis: ['application/pdf', 'image/jpeg', 'image/png'],
  laudo: ['application/pdf', 'image/jpeg', 'image/png'],
};

export type PacienteFields = {
  nome: string;
  data_nascimento: string;
  responsaveis: string;
  cpf: string;
  contatos: string;
  diagnostico: string;
  cid: string;
  tratamentos: string;
  medicacoes: string;
  local_atendimento: string;
  renda_bruta_familiar: string;
  pessoas_residencia: string;
  casa_situacao: string;
  recebe_beneficio: string;
  instituicao_ensino: string;
  endereco_escola: string;
  nivel_escolaridade: string;
  acompanhamento_especializado: string;
  observacoes: string;
};

export const initialState: PacienteFields = {
  nome: '',
  data_nascimento: '',
  responsaveis: '',
  cpf: '',
  contatos: '',
  diagnostico: '',
  cid: '',
  tratamentos: '',
  medicacoes: '',
  local_atendimento: '',
  renda_bruta_familiar: '',
  pessoas_residencia: '',
  casa_situacao: '',
  recebe_beneficio: '',
  instituicao_ensino: '',
  endereco_escola: '',
  nivel_escolaridade: '',
  acompanhamento_especializado: '',
  observacoes: '',
};

export async function uploadFileToStorage(file: File, bucket: string, userId: string) {
  const supabase = createClient();

  const originalName = file.name.trim();
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const ext = lastDot > 0 ? originalName.slice(lastDot + 1) : 'file';

  const safeBase = baseName.replace(/\s+/g, '-').toLowerCase();
  const filePath = `${userId}/${Date.now()}-${safeBase}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`Erro ao enviar arquivo (${bucket}): ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl ?? '';
}

export async function cadastrarPaciente(
  fields: PacienteFields,
  files: Partial<Record<FileField, File>>
) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const fileUrls: Partial<Record<FileField, string>> = {};

  // Nomes dos buckets exatamente como estão no Supabase
  const buckets: Record<FileField, string> = {
    foto: 'foto',
    documento: 'documento',
    documento_responsaveis: 'documento_responsaveis',
    laudo: 'laudo',
  };

  for (const key of Object.keys(files) as FileField[]) {
    const file = files[key];
    if (file) {
      fileUrls[key] = await uploadFileToStorage(file, buckets[key], user.id);
    }
  }

  const { error: dbError } = await supabase
    .from('cadastros')
    .insert([{ ...fields, ...fileUrls, user_id: user.id }]);

  if (dbError) throw new Error(dbError.message || 'Erro ao salvar cadastro.');
  return true;
}
