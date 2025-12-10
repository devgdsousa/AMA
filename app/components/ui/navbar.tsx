'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { Button } from '@/app/components/ui/button';
import { createClient } from '@/app/utils/supabase/client';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);

        // Verifica se o usuário logado é admin na tabela user_login
        const { data: profile, error:profileError} = await supabase
          .from('user_login')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/40 border-b border-white/30 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Logo Ama-Timon"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
              Início
            </Link>
            <Link href="/cadastros" className="text-gray-700 hover:text-indigo-600">
              Realizar Cadastros
            </Link>
            <Link href="/PessoaTEA" className="text-gray-700 hover:text-indigo-600">
              Pacientes
            </Link>
            <Link href="/relatorios" className="text-gray-700 hover:text-indigo-600">
              Relatórios
            </Link>
            <Link href="/consulta" className="text-gray-700 hover:text-indigo-600">
              Consulta
            </Link>
            {isAdmin && (
              <Link
                href="/admin/usuarios"
                className="text-indigo-700 font-semibold hover:text-indigo-800"
              >
                Administração
              </Link>
            )}
          </nav>

          {/* mobile toggle + ações */}
          <div className="flex items-center space-x-3">
            {user && (
              <span className="hidden lg:inline text-xs text-gray-600">
                Usuário:{' '}
                <span className="font-semibold text-gray-800">
                  {user.user_metadata?.name || user.email}
                </span>
              </span>
            )}

            <div className="hidden sm:block">
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Fazer Logout
              </Button>
            </div>

            {/* Botão hamburguer (mobile) */}
            <button
              type="button"
              className="inline-flex flex-col items-center justify-center gap-1 rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              onClick={() => setOpen(prev => !prev)}
              aria-label="Abrir menu"
            >
              <span
                className={`block h-0.5 w-5 bg-gray-700 transition-transform duration-200 ${
                  open ? 'translate-y-1.5 rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-gray-700 transition-opacity duration-200 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-gray-700 transition-transform duration-200 ${
                  open ? '-translate-y-1.5 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3 space-y-2">
            <nav className="flex flex-col space-y-1 text-sm font-medium">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/cadastros"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Realizar Cadastros
              </Link>
              <Link
                href="/PessoaTEA"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Pacientes
              </Link>
              <Link
                href="/relatorios"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Relatórios
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/usuarios"
                  className="px-3 py-2 rounded-md text-indigo-700 hover:bg-indigo-50"
                  onClick={() => setOpen(false)}
                >
                  Administração
                </Link>
              )}
            </nav>

            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              {user && (
                <span className="text-xs text-gray-600">
                  {user.user_metadata?.name || user.email}
                </span>
              )}
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Fazer Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
