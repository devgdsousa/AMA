// app/api/admin/create-user/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const { nome, email, senha, role } = await req.json() as {
      nome: string;
      email: string;
      senha: string;
      role: 'admin' | 'user';
    };

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios.' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // 1) Cria usuário na Auth
    const { data: created, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      });

    if (authError || !created.user) {
      return NextResponse.json(
        { error: authError?.message || 'Erro ao criar usuário na Auth.' },
        { status: 400 },
      );
    }

    const userId = created.user.id;

    // 2) Cria linha em user_login
    const { data, error: dbError } = await supabase
      .from('user_login')
      .insert({
        id: userId,
        nome,
        email,
        senha,      // idealmente usar hash ou outra coluna
        role,
        is_active: true,
      })
      .select('*')
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message || 'Erro ao criar user_login.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ user: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erro inesperado ao criar usuário.' },
      { status: 500 },
    );
  }
}
