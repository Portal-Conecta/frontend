/**
 * turmasService — lista todas as turmas para a página de gerenciamento (server-only).
 *
 * O core (via gateway `/hub`) expõe turmas e cursos separados e sem busca — então
 * buscamos ambos e juntamos aqui, reusando o `fetchAllClasses`/`listCourses` do
 * `coursesService`. A busca de texto é aplicada no cliente (`filterTurmas`).
 */
import { fetchAllClasses, listCourses } from '../courses/coursesService'
import { toTurmaRows, type TurmaRow } from './turmaRows'

export async function listTurmas(token: string): Promise<TurmaRow[]> {
  const [{ courses }, classes] = await Promise.all([listCourses(token), fetchAllClasses(token)])
  return toTurmaRows(courses, classes)
}
