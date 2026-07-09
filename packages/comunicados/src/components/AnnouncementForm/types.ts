/**
 * Tipos do formulário de criação de comunicado (#197, modo criar).
 *
 * O fluxo é um wizard: etapa 1 = conteúdo (imagens + título + descrição), etapa 2
 * = destinatários (#195) e etapa 3 = publicar/agendar (#196). Estes tipos cobrem
 * a etapa 1; as demais entram quando os componentes chegarem à branch.
 */

/**
 * Imagem escolhida no `ImageUploader`.
 *
 * O upload real acontece em duas fases (cria o comunicado, depois sobe os
 * arquivos ao id — ver `useCreateAnnouncement`/#193), então aqui guardamos o
 * `File` local e uma `previewUrl` (object URL) só para exibir a miniatura. Itens
 * que já existem no servidor (edição, futura) podem vir sem `file`, só com a URL.
 */
export interface ImageItem {
  /** id local, estável para key/remoção. */
  id: string
  /** URL de preview — object URL (arquivo local) ou URL remota. */
  previewUrl: string
  /** Arquivo local a enviar. Ausente para imagens já persistidas. */
  file?: File
  /** Nome do arquivo, usado no `alt` e no aria-label de remoção. */
  name?: string
}

/** Conteúdo da etapa 1 do wizard. */
export interface AnnouncementContentValue {
  images: ImageItem[]
  title: string
  description: string
}

/** Erros por campo da etapa 1 (mensagens vindas de validação/back). */
export type AnnouncementContentErrors = Partial<
  Record<keyof AnnouncementContentValue, string>
>

export const EMPTY_ANNOUNCEMENT_CONTENT: AnnouncementContentValue = {
  images: [],
  title: '',
  description: '',
}
