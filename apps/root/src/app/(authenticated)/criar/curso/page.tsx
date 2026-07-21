import { redirect } from 'next/navigation'

/** Mantém compatibilidade com o endereço antigo e centraliza a tela na seção Cursos. */
export default function LegacyCriarCursoPage() {
  redirect('/cursos/criar')
}
