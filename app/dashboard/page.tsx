'use client';

import { SearchInput } from '@/app/components/ui/search';
import { Footer } from '@/app/components/ui/footer';
import Image from 'next/image';
import { Navbar } from '@/app/components/ui/navbar';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-no-repeat bg-center bg-cover flex flex-col bg-[#f5f0e6]">
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Conteúdo principal */}
        <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          <div className="min-h-[50vh] mb-10">
            <h1
              className="
                text-2xl sm:text-3xl md:text-4xl 
                font-extrabold text-gray-900 gap-8 mb-7
              "
            >
              Bem vindo ao sistema AMA !
            </h1>

            <SearchInput
              placeholder="Buscar cadastro por nome"
              variant="outline"
              sizeVariant="lg"
            />
          </div>

          <div className="pointer-events-none fixed bottom-2 right-0 sm:bottom-4 sm:right-1 md:bottom-6 md:right-4 lg:bottom-10 lg:right-10 z-10">
            <div
              className="
                relative
                w-80 h-105
                sm:w-80 sm:h-150
                md:w-80 md:h-150
                lg:w-80 lg:h-150
                xl:w-110 xl:h-180
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
