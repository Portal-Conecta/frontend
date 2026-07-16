import { describe, expect, it } from 'vitest'

import {
  ANNOUNCEMENT_DESTINATION_TYPE,
  ANNOUNCEMENT_ORIGIN,
  ANNOUNCEMENT_STATUS,
  type AnnouncementDetail,
} from '../../src/types/announcement'
import {
  buildEditUpdatePayload,
  enrichRecipientsFromCatalog,
  mapDetailToEditForm,
  resolveRemovedImageIds,
} from '../../src/components/EditAnnouncementWizard/mapAnnouncementDetailToForm'

function makeDetail(overrides: Partial<AnnouncementDetail> = {}): AnnouncementDetail {
  return {
    announcement: {
      id: 'a1',
      title: 'Título',
      description: '<p>Olá</p>',
      origin: ANNOUNCEMENT_ORIGIN.BOTH,
      status: ANNOUNCEMENT_STATUS.SCHEDULED,
      pinned: false,
      pinnedOrder: null,
      createdByUserId: 'u1',
      publishedByUserId: null,
      scheduledFor: '2026-12-01T15:00:00.000Z',
      publishedAt: null,
      removedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    destinations: [
      {
        id: 'd1',
        announcementId: 'a1',
        type: ANNOUNCEMENT_DESTINATION_TYPE.COURSE,
        referenceId: 'curso-ds',
      },
    ],
    files: [
      {
        id: 'img-1',
        announcementId: 'a1',
        originalName: 'capa.png',
        s3Key: 'k',
        s3Bucket: 'b',
        displayUrl: 'https://cdn.example/capa.png',
        contentType: 'image/png',
        type: 'IMAGE',
        sizeBytes: 10,
        isThumbnail: true,
        uploadedByUserId: 'u1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    tags: [{ announcementId: 'a1', tagId: 'curso-ds', tagName: 'DS' }],
    mentions: [],
    ...overrides,
  }
}

describe('mapDetailToEditForm', () => {
  it('mapeia título, descrição, imagem remota e destinatários', () => {
    const form = mapDetailToEditForm(makeDetail())

    expect(form.content.title).toBe('Título')
    expect(form.content.description).toBe('<p>Olá</p>')
    expect(form.content.images).toEqual([
      {
        id: 'img-1',
        previewUrl: 'https://cdn.example/capa.png',
        name: 'capa.png',
      },
    ])
    expect(form.recipients).toEqual([
      { key: 'course:curso-ds', kind: 'course', refId: 'curso-ds', label: 'DS' },
    ])
    expect(form.scheduledFor).toBe('2026-12-01T15:00:00.000Z')
    expect(form.initialImageIds).toEqual(['img-1'])
  })

  it('resolve previewUrl via processedS3Key quando displayUrl falta', () => {
    const form = mapDetailToEditForm(
      makeDetail({
        files: [
          {
            id: 'img-2',
            announcementId: 'a1',
            originalName: 'foto.png',
            s3Key: 'raw/key',
            s3Bucket: 'comunicados-raw-sa',
            processedS3Key: 'comunicados/post/processed/foto.png',
            displayUrl: null,
            contentType: 'image/png',
            type: 'IMAGE',
            fileStatus: 'READY',
            sizeBytes: 10,
            isThumbnail: true,
            uploadedByUserId: 'u1',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    )

    expect(form.content.images[0]?.previewUrl).toContain('comunicados-processed-sa')
    expect(form.content.images[0]?.previewUrl).toContain('processed/foto.png')
  })

  it('zera scheduledFor quando o status é PUBLISHED', () => {
    const form = mapDetailToEditForm(
      makeDetail({
        announcement: {
          ...makeDetail().announcement,
          status: ANNOUNCEMENT_STATUS.PUBLISHED,
          scheduledFor: null,
        },
      }),
    )

    expect(form.scheduledFor).toBeNull()
    expect(form.status).toBe(ANNOUNCEMENT_STATUS.PUBLISHED)
  })

  it('envolve descrição plain-text em <p> para o TipTap', () => {
    const form = mapDetailToEditForm(
      makeDetail({
        announcement: {
          ...makeDetail().announcement,
          description: 'Texto puro sem HTML',
        },
      }),
    )

    expect(form.content.description).toBe('<p>Texto puro sem HTML</p>')
  })

  it('GENERAL sem tag ROLE vira Público geral (broadcast), não Todos os Alunos', () => {
    const form = mapDetailToEditForm(
      makeDetail({
        destinations: [
          {
            id: 'd-gen',
            announcementId: 'a1',
            type: ANNOUNCEMENT_DESTINATION_TYPE.GENERAL,
            referenceId: null,
          },
        ],
        tags: [],
      }),
    )

    expect(form.recipients).toEqual([
      { key: 'group:EVERYONE', kind: 'group', refId: 'EVERYONE', label: 'Público geral' },
    ])
  })

  it.each([
    ['Alunos', 'role-student', 'STUDENTS', 'Todos os Alunos'],
    ['Professores', 'role-teacher', 'TEACHERS', 'Todos os Professores'],
    ['Representantes', 'role-representative', 'REPRESENTATIVES', 'Todos os Representantes'],
  ] as const)(
    'GENERAL + tag ROLE %s reconstitui o grupo %s',
    (tagName, tagId, group, label) => {
      const form = mapDetailToEditForm(
        makeDetail({
          destinations: [
            {
              id: 'd-gen',
              announcementId: 'a1',
              type: ANNOUNCEMENT_DESTINATION_TYPE.GENERAL,
              referenceId: null,
            },
          ],
          tags: [{ announcementId: 'a1', tagId, tagName }],
        }),
      )

      expect(form.recipients).toEqual([
        { key: `group:${group}`, kind: 'group', refId: group, label },
      ])
    },
  )
})

describe('enrichRecipientsFromCatalog', () => {
  it('substitui UUID pelo nome do curso/turma', () => {
    const enriched = enrichRecipientsFromCatalog(
      [
        { key: 'course:c1', kind: 'course', refId: 'c1', label: 'c1' },
        { key: 'class:t1', kind: 'class', refId: 't1', label: 't1' },
      ],
      [{ value: 'c1', label: 'Desenvolvimento de Sistemas' }],
      [{ value: 't1', label: 'DS 2026' }],
    )

    expect(enriched[0]?.label).toBe('Desenvolvimento de Sistemas')
    expect(enriched[1]?.label).toBe('DS 2026')
  })
})

describe('buildEditUpdatePayload', () => {
  it('SCHEDULED → publicar agora envia status PUBLISHED e scheduledFor null', () => {
    expect(
      buildEditUpdatePayload({
        title: 'T',
        description: 'D',
        destinations: [{ type: 'GENERAL' }],
        currentStatus: ANNOUNCEMENT_STATUS.SCHEDULED,
        scheduledFor: null,
      }),
    ).toEqual({
      title: 'T',
      description: 'D',
      destinations: [{ type: 'GENERAL' }],
      status: ANNOUNCEMENT_STATUS.PUBLISHED,
      scheduledFor: null,
    })
  })

  it('PUBLISHED → agendar envia status SCHEDULED + scheduledFor', () => {
    expect(
      buildEditUpdatePayload({
        title: 'T',
        description: 'D',
        destinations: [{ type: 'USER', referenceId: 'u1' }],
        currentStatus: ANNOUNCEMENT_STATUS.PUBLISHED,
        scheduledFor: '2026-12-10T12:00:00.000Z',
      }),
    ).toEqual({
      title: 'T',
      description: 'D',
      destinations: [{ type: 'USER', referenceId: 'u1' }],
      status: ANNOUNCEMENT_STATUS.SCHEDULED,
      scheduledFor: '2026-12-10T12:00:00.000Z',
    })
  })

  it('SCHEDULED com nova data envia scheduledFor sem mudar status', () => {
    expect(
      buildEditUpdatePayload({
        title: 'T',
        description: 'D',
        destinations: [{ type: 'GENERAL' }],
        currentStatus: ANNOUNCEMENT_STATUS.SCHEDULED,
        scheduledFor: '2026-12-20T10:00:00.000Z',
      }),
    ).toEqual({
      title: 'T',
      description: 'D',
      destinations: [{ type: 'GENERAL' }],
      scheduledFor: '2026-12-20T10:00:00.000Z',
    })
  })
})

describe('resolveRemovedImageIds', () => {
  it('detecta imagens remotas removidas do FileUpload', () => {
    expect(
      resolveRemovedImageIds(['img-1', 'img-2'], [
        { id: 'img-1', previewUrl: 'https://cdn.example/1.png' },
        { id: 'local', previewUrl: 'blob:x', file: new File([], 'n.png') },
      ]),
    ).toEqual(['img-2'])
  })
})
