'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/app/utils/supabase/client';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="animate-pulse text-gray-500 text-lg">Carregando...</span>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-blue-700 text-white px-8 py-4 flex items-center justify-between shadow">
        <h1 className="text-2xl font-bold">Dashboard Ama-Timon</h1>
        {user && (
          <span className="font-medium">
            Usuário: {user.user_metadata?.name || user.email}
          </span>
        )}
      </header>
      
      {/* Main dashboard area */}
      <main className="p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-2">Bem-vindo ao sistema</h2>
          <p className="mb-4 text-gray-700">
            Aqui você poderá gerenciar pacientes e visualizar informações do sistema.
          </p>
          
          {/* Cards exemplo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-blue-100 border-l-4 border-blue-700 p-4 rounded">
              <span className="block text-lg font-bold text-blue-700">Pacientes</span>
              <span className="block text-2xl font-semibold mt-2">0</span>
              <span className="block text-sm text-gray-600">Registros</span>
            </div>
            <div className="bg-green-100 border-l-4 border-green-700 p-4 rounded">
              <span className="block text-lg font-bold text-green-700">Agendamentos</span>
              <span className="block text-2xl font-semibold mt-2">0</span>
              <span className="block text-sm text-gray-600">Pendentes</span>
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-700 p-4 rounded">
              <span className="block text-lg font-bold text-yellow-700">Notificações</span>
              <span className="block text-2xl font-semibold mt-2">0</span>
              <span className="block text-sm text-gray-600">Novas</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
