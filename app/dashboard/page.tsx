'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Button } from "@/app/components/ui/button";
import { SearchInput } from '@/app/components/ui/search';
import { Footer } from '@/app/components/ui/footer';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/app/utils/supabase/client';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push('/login');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="animate-pulse text-gray-500 text-lg">Carregando...</span>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen bg-no-repeat bg-center bg-cover flex flex-col bg-[#f5f0e6]"
    >
      {/* Header + Main ocupam o espaço flexível */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
       <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/40 border-b border-white/30 shadow-sm">
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
                  Voltar ao Início
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

                
              </nav>

              {/* mobile toggle + ações */}
              <div className="flex items-center space-x-3">
                {user && (
                  <span className="hidden lg:inline text-xs text-gray-600">
                    Usuário:{" "}
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
                  onClick={() => setOpen((prev) => !prev)}
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
                    Voltar ao Início
                  </Link>
                  <Link
                    href="/cadastros"
                    className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Realizar Cadastros
                  </Link>
                  <Link
                    href="/relatorios"
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

        {/* Conteúdo principal */}
        <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          <div className=" min-h-[50vh] mb-10 ">
            <h1
              className="
                text-2xl sm:text-3xl md:text-4xl 
                font-extrabold text-gray-900 gap-8 mb-7
              "
            >
              Bem vindo ao sistema AMA !
            </h1>
          
            <SearchInput
              placeholder="Buscar por nome"
              variant="outline"
              sizeVariant="lg"
            />
          </div>
  

          <div className="pointer-events-none fixed bottom-2 right-0 sm:bottom-4 sm:right-1 md:bottom-6 md:right-4 lg:bottom-10 lg:right-10 z-10">
              <div
                className="
                  relative
                  w-80  h-105         /* mobile muito pequena */
                  sm:w-80 sm:h-150     /* small */
                  md:w-80 md:h-150    /* medium */
                  lg:w-80 lg:h-150    /* large */
                  xl:w-110 xl:h-180    /* extra large */
                "
              >
                <Image
                  src="/Group.svg"
                  alt="Ilustração Ama-Timon"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
