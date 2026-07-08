'use client';

import React from 'react';

interface PageEditarComunicadoProps {
  announcementId: string;
}

export function PageEditarComunicado({ announcementId }: PageEditarComunicadoProps) {
  return (
    <main className="container mx-auto p-6 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Editar Comunicado
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          ID do Comunicado: {announcementId}
        </p>
      </header>

      <section className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <p className="text-neutral-600 dark:text-neutral-300">
          Formulário de edição (#204) será integrado aqui com os dados do ID informado.
        </p>
      </section>
    </main>
  );
}