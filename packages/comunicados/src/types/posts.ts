export type ListPostsParamValue = string | number | boolean | readonly string[] | readonly number[] | readonly boolean[]

export interface ListPostsParams {
  page?: string | number
  size?: string | number
  search?: string
  status?: string
  [key: string]: ListPostsParamValue | undefined
}

export interface AnnouncementPost {
  id: string | number
  title?: string
  titulo?: string
  content?: string
  conteudo?: string
  summary?: string
  resumo?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  [key: string]: unknown
}

export interface ListAnnouncementsResponse {
  content: AnnouncementPost[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
  number?: number
  first?: boolean
  last?: boolean
  empty?: boolean
  [key: string]: unknown
}
