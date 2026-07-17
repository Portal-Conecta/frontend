/**
 * PageProfile — "Meu Perfil" (issue #304, Figma node 2511:20637). Espelha o
 * controle de fluxo de `PageNotifications`, estendido pras duas chamadas do
 * BFF de perfil: se `getMyProfile` falhar, a página inteira falha (não há o
 * que mostrar); se só `getMyCourses` falhar, degrada graciosamente — o resto
 * da página renderiza normal e a seção de turmas vira um Banner de erro.
 */
import { redirect } from 'next/navigation'

import { Avatar, Banner, ClassCard, Text, type ClassCardItem } from '@portal/ui'

import { getSession } from '../auth/session'
import { HttpError } from '../http/errors'
import { flattenClasses } from '../profile/flattenClasses'
import { getMyCourses, getMyProfile } from '../profile/profileService'
import { ROLE_LABELS } from '../profile/roleLabels'
import type { MyProfile } from '../profile/types'

export async function PageProfile() {
  const accessToken = await getSession()
  if (!accessToken) {
    redirect('/login')
  }

  let profile: MyProfile
  try {
    profile = await getMyProfile(accessToken)
  } catch (err) {
    if (err instanceof HttpError && err.kind === 'unauthorized') {
      redirect('/login')
    }
    throw err
  }

  let classes: ClassCardItem[] = []
  let coursesFailed = false
  try {
    const { courses } = await getMyCourses(accessToken)
    classes = flattenClasses(courses)
  } catch (err) {
    if (err instanceof HttpError && err.kind === 'unauthorized') {
      redirect('/login')
    }
    coursesFailed = true
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Escala responsiva (h3 mobile → h2 tablet/desktop): fora do variant fixo do
      Text, mesmo padrão de token empilhado por breakpoint do ErrorPage (display-*). */}
      <h1 className="text-heading-h3 font-inter text-text-brand md:text-heading-h2">Meu Perfil</h1>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 md:items-start">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <Avatar />
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Text variant="label-md-emphasis" tone="brand">
              {profile.name}
            </Text>
            <Text variant="label-sm" tone="secondary">
              {profile.email}
            </Text>
            <Text variant="label-sm" tone="secondary">
              {ROLE_LABELS[profile.typeUser]}
            </Text>
          </div>
        </div>

        {coursesFailed ? (
          <Banner variant="error" className="w-full">
            Não foi possível carregar suas turmas.
          </Banner>
        ) : classes.length === 1 ? (
          <ClassCard variant="list" title="Turma" items={classes} className="w-full" />
        ) : classes.length > 1 ? (
          <ClassCard variant="list" items={classes} className="w-full" />
        ) : null}

        <Banner variant="info" className="w-full">
          Sua conta é gerenciada por um administrador. Caso precise alterar algum dado, procure alguém com este
          acesso.
        </Banner>
      </div>
    </div>
  )
}

export default PageProfile
