'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as z from 'zod';
import { createClient } from '@/app/utils/supabase/client';
import { Button } from '@/app/components/ui/button';

const loginSchema = z.object({
  email: z.string().email({ message: 'Insira um e-mail válido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push('/dashboard');
    });
    return () => data?.subscription?.unsubscribe?.();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validate = loginSchema.safeParse({ email, password });
    if (!validate.success) {
      setError(validate.error.issues?.[0]?.message || 'Entrada inválida');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message || 'Email ou senha inválidos');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* camada de leve escurecimento para contraste */}
      <div className="absolute inset-0 bg-blue-900/40" />

      {/* Card central */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-3xl bg-white/15 border border-white/25 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.8)] px-6 sm:px-8 py-8 sm:py-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Logo Ama-Timon"
              width={160}
              height={50}
              className="object-contain"
            />
          </div>

          {/* Título */}
          <h2 className="text-center text-lg font-semibold text-white mb-6">
            Login
          </h2>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-blue-100">
                Email
              </label>
              <input
                className="w-full px-3 py-2 rounded-md bg-white/95 text-sm text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                           placeholder:text-slate-400"
                type="email"
                value={email}
                autoComplete="username"
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-blue-100">
                Senha
              </label>
              <div
                className="
                  w-full flex items-center rounded-md bg-white/95
                  focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400
                  border border-transparent
                "
              >
                <input
                  className="flex-1 px-3 py-2 bg-transparent text-sm text-slate-900
                             focus:outline-none placeholder:text-slate-400"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="px-3 text-xs text-slate-600 hover:text-slate-800"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full mt-2 bg-blue-900 hover:bg-blue-800 text-white"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
