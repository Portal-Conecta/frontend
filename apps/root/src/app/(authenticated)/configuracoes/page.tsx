import { redirect } from 'next/navigation'

/** Alias legado da nav "Configurações" → lista de usuários (#440). */
export default function ConfiguracoesRedirectPage() {
  redirect('/usuarios')
}
