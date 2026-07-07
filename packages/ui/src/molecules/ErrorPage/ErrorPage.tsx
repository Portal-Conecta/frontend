import { Text } from "@portal/ui/atoms";

export interface ErrorPageProps {
  /** Código HTTP exibido em destaque. Referência de valores: `'403' | '404' | '500'`. */
  code: string;
  title: string;
  description: string;
}

/**
 * ErrorPage — página fina de feedback de erro (404/403/500). Componente burro:
 * recebe `code`, `title` e `description` já resolvidos; o mapeamento status→texto
 * vive na camada de página, não aqui.
 */
export function ErrorPage({ code, title, description }: ErrorPageProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      {/*
        Número gigante do erro: escala display responsiva (tokens display-sm→xl) +
        tracking-display. O text-indent compensa o espaço final que o letter-spacing
        cria após o último dígito, recentralizando os glifos (offset de layout, §8.1).
      */}
      <h1 className="text-display-sm tracking-display text-interactive-subtle [text-indent:0.6em] sm:text-display-md md:text-display-lg lg:text-display-xl">
        {code}
      </h1>
      <div className="flex flex-col items-center gap-4">
        <Text tone="brand" variant="heading-h2" className="lg:text-heading-h1">
          {title}
        </Text>
        <Text tone="secondary" variant="body-sm">
          {description}
        </Text>
      </div>
    </div>
  );
}
