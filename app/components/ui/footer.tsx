// app/components/ui/footer.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-10 no-print">
      <div
        className="
          border-t border-white/10
          bg-gradient-to-r from-emerald-600 via-red-600 to-black
          bg-opacity-80
          backdrop-blur-xl
        "
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo esquerda */}
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo Ama-Timon"
                width={120}
                height={40}
                className="object-contain drop-shadow-md"
              />
            </div>

            {/* Centro: GitHub + user */}
            <div className="flex flex-col items-center justify-center text-white text-xs sm:text-sm">
              <Link
                href="https://github.com/devgdsousa"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Image
                  src="/Git.png" 
                  alt="GitHub"
                  width={50}
                  height={50}
                  className="object-contain"
                />
                <span className="font-medium">@devgdsousa</span>
              </Link>
              <span className="mt-1 text-[10px] sm:text-xs opacity-80">
                Todos os direitos reservados © 2025
              </span>
            </div>

            {/* Logo direita */}
            <div className="flex items-center justify-end">
              <Image
                src="/logo-footer.png"
                alt="Logo Ama-Timon Footer"
                width={120}
                height={40}
                className="object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
