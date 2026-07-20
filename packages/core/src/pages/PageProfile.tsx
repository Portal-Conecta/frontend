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

  // Dispara as duas chamadas do BFF em paralelo (elimina o waterfall — #407).
  // `allSettled` nunca rejeita, então cada resultado é tratado pelo seu próprio
  // status, preservando a degradação: `profile` é obrigatório (rejeição derruba
  // a página inteira) e `courses` é opcional (rejeição vira Banner de erro).
  const [profileResult, coursesResult] = await Promise.allSettled([
    getMyProfile(accessToken),
    getMyCourses(accessToken),
  ])

  if (profileResult.status === 'rejected') {
    const err = profileResult.reason
    if (err instanceof HttpError && err.kind === 'unauthorized') {
      redirect('/login')
    }
    throw err
  }
  const profile: MyProfile = profileResult.value

  let classes: ClassCardItem[] = []
  let coursesFailed = false
  if (coursesResult.status === 'fulfilled') {
    classes = flattenClasses(coursesResult.value.courses)
  } else {
    const err = coursesResult.reason
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
        ) : classes.length > 0 ? (
          <div className="flex max-w-full flex-col gap-3 rounded-lg bg-background-default p-8">
            <Text variant='label-sm-emphasis' tone='brand'>Turmas</Text>
            {classes.map((turma) => (
              <ClassCard key={turma.tag} variant="withBackground" {...turma} />
            ))}
          </div>
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
