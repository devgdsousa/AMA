'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { Navbar } from '@/app/components/ui/navbar';
import { Footer } from '@/app/components/ui/footer';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { SearchInput } from '@/app/components/ui/search';

type UserLogin = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string | null;
  is_active: boolean;
};

type EditState = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: 'admin' | 'user';
  is_active: boolean;
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busca, setBusca] = useState('');

  // Form de criação
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  // Edição inline
  const [editando, setEditando] = useState<EditState | null>(null);

  async function carregarUsuarios() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const supabase = createClient();

      // Garante que é admin no client também (extra além da RLS)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }

      const { data: me, error: meError } = await supabase
        .from('user_login')
        .select('role')
        .eq('id', user.id)
        .single();

      if (meError || !me || me.role !== 'admin') {
        setError('Acesso negado. Somente administradores podem ver esta página.');
        return;
      }

      const { data, error } = await supabase
        .from('user_login')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        setError('Não foi possível carregar os usuários.');
        return;
      }

      setUsuarios((data || []) as UserLogin[]);
    } catch {
      setError('Erro inesperado ao carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return usuarios;
    return usuarios.filter(
      u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo),
    );
  }, [busca, usuarios]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!nome || !email || !senha) {
        setError('Preencha nome, email e senha.');
        return;
      }

      // Chama API que usa service_role para criar na Auth e no user_login
      const resp = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, role }),
      });

      const body = await resp.json();

      if (!resp.ok) {
        setError(body.error || 'Erro ao criar usuário.');
        return;
      }

      // Recarrega lista do Supabase para garantir que tudo esteja sincronizado
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_login')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        setError('Usuário criado, mas houve erro ao recarregar a lista.');
      } else {
        setUsuarios((data || []) as UserLogin[]);
        setSuccess('Usuário criado com sucesso.');
      }

      setNome('');
      setEmail('');
      setSenha('');
      setRole('user');
    } catch {
      setError('Erro inesperado ao criar usuário.');
    } finally {
      setSaving(false);
    }
  }

  function iniciarEdicao(usuario: UserLogin) {
    setEditando({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      role: usuario.role,
      is_active: usuario.is_active,
    });
    setError('');
    setSuccess('');
  }

  function cancelarEdicao() {
    setEditando(null);
  }

  async function salvarEdicao() {
    if (!editando) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();

      const payload: Partial<UserLogin> = {
        nome: editando.nome,
        email: editando.email,
        role: editando.role,
        is_active: editando.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editando.senha.trim()) {
        payload.senha = editando.senha.trim();
      }

      const { error } = await supabase
        .from('user_login')
        .update(payload)
        .eq('id', editando.id);

      if (error) {
        setError(error.message || 'Erro ao atualizar usuário.');
        return;
      }

      setUsuarios(prev =>
        prev.map(u =>
          u.id === editando.id
            ? {
                ...u,
                nome: editando.nome,
                email: editando.email,
                role: editando.role,
                is_active: editando.is_active,
                senha: payload.senha ?? u.senha,
                updated_at: new Date().toISOString(),
              }
            : u,
        ),
      );

      setSuccess('Usuário atualizado com sucesso.');
      setEditando(null);
    } catch {
      setError('Erro inesperado ao atualizar usuário.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const supabase = createClient();
      const { error } = await supabase.from('user_login').delete().eq('id', id);
      if (error) {
        setError(error.message || 'Erro ao excluir usuário.');
        return;
      }

      setUsuarios(prev => prev.filter(u => u.id !== id));
      setSuccess('Usuário excluído com sucesso.');
    } catch {
      setError('Erro inesperado ao excluir usuário.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e6]">
        <span className="animate-pulse text-gray-500 text-lg">
          Carregando usuários...
        </span>
      </main>
    );
  }

  if (error && usuarios.length === 0 && !success) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f0e6]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white/90 rounded-2xl shadow-lg border border-red-100 p-6 text-center">
            <h1 className="text-xl font-semibold text-red-700 mb-2">
              Acesso à área de administração
            </h1>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e6]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Gestão de usuários
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Crie novos usuários, defina como administrador ou usuário comum e gerencie
          acessos ao sistema.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          {/* Card de criação */}
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Criar novo usuário
            </h2>
            <p className="text-xs text-slate-500 mb-2">
              Preencha os dados abaixo para adicionar um novo usuário ao sistema.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome completo
                </label>
                <Input
                  name="nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  type="text"
                  placeholder="Ex.: Maria da Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Senha
                </label>
                <Input
                  name="senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <p className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de usuário
                </p>
                <div className="inline-flex items-center gap-3 rounded-full bg-slate-50 p-1 border border-slate-200">
                  <Button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`px-3 py-1.5 text-xs rounded-full transition ${
                      role === 'user'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    Usuário comum
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`px-3 py-1.5 text-xs rounded-full transition ${
                      role === 'admin'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    Administrador
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Criar usuário'}
                </Button>
              </div>
            </form>
          </section>

          {/* Card de listagem */}
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Usuários cadastrados
                </h2>
                <p className="text-xs text-slate-500">
                  Pesquise pelo nome ou email, edite ou remova usuários.
                </p>
              </div>

              <SearchInput
                placeholder="Buscar por nome ou email..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                variant="outline"
                sizeVariant="sm"
              />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70 flex-1 flex flex-col">
              {filtrados.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  Nenhum usuário encontrado.
                </p>
              ) : (
                <div className="max-h-[480px] overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="text-left font-semibold px-3 py-2">Nome</th>
                        <th className="text-left font-semibold px-3 py-2">Email</th>
                        <th className="text-left font-semibold px-3 py-2">
                          Tipo
                        </th>
                        <th className="text-left font-semibold px-3 py-2">
                          Status
                        </th>
                        <th className="text-right font-semibold px-3 py-2">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map(u => {
                        const emEdicao = editando?.id === u.id;
                        return (
                          <tr
                            key={u.id}
                            className="border-b border-slate-200/70 hover:bg-white"
                          >
                            <td className="px-3 py-2 align-top">
                              {emEdicao ? (
                                <Input
                                  value={editando?.nome ?? ''}
                                  onChange={e =>
                                    setEditando(prev =>
                                      prev
                                        ? { ...prev, nome: e.target.value }
                                        : prev,
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900">
                                    {u.nome}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {new Date(u.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {emEdicao ? (
                                <Input
                                  value={editando?.email ?? ''}
                                  onChange={e =>
                                    setEditando(prev =>
                                      prev
                                        ? { ...prev, email: e.target.value }
                                        : prev,
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              ) : (
                                <span className="text-slate-700">{u.email}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {emEdicao ? (
                                <select
                                  value={editando?.role ?? 'user'}
                                  onChange={e =>
                                    setEditando(prev =>
                                      prev
                                        ? {
                                            ...prev,
                                            role:
                                              e.target
                                                .value as EditState['role'],
                                          }
                                        : prev,
                                    )
                                  }
                                  className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
                                >
                                  <option value="user">Usuário</option>
                                  <option value="admin">Admin</option>
                                </select>
                              ) : (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                    u.role === 'admin'
                                      ? 'bg-indigo-100 text-indigo-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {u.role === 'admin' ? 'Admin' : 'Usuário'}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {emEdicao ? (
                                <Button
                                  type="button"
                                  onClick={() =>
                                    setEditando(prev =>
                                      prev
                                        ? {
                                            ...prev,
                                            is_active: !prev.is_active,
                                          }
                                        : prev,
                                    )
                                  }
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                    editando?.is_active
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {editando?.is_active ? 'Ativo' : 'Inativo'}
                                </Button>
                              ) : (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                    u.is_active
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {u.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <div className="flex flex-col gap-2 items-end">
                                {emEdicao && (
                                  <Input
                                    type="password"
                                    placeholder="Nova senha (opcional)"
                                    value={editando?.senha ?? ''}
                                    onChange={e =>
                                      setEditando(prev =>
                                        prev
                                          ? { ...prev, senha: e.target.value }
                                          : prev,
                                      )
                                    }
                                    className="h-8 text-xs max-w-[180px]"
                                  />
                                )}

                                <div className="flex items-center justify-end gap-2">
                                  {emEdicao ? (
                                    <>
                                      <Button
                                        size="sm"
                                        className="h-7 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={saving}
                                        onClick={salvarEdicao}
                                      >
                                        Salvar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-3 text-[11px]"
                                        onClick={cancelarEdicao}
                                        disabled={saving}
                                      >
                                        Cancelar
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-3 text-[11px]"
                                        onClick={() => iniciarEdicao(u)}
                                        disabled={saving}
                                      >
                                        Editar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-7 px-3 text-[11px]"
                                        onClick={() => handleDelete(u.id)}
                                        disabled={saving}
                                      >
                                        Excluir
                                      </Button>
                                    </>
                                  )}
                                </div>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
