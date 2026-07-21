import { redirect } from 'next/navigation'

/** Alias legado "Configurações" → gestão de usuários. */
export default function ConfiguracoesRedirectPage() {
  redirect('/usuarios')
}
