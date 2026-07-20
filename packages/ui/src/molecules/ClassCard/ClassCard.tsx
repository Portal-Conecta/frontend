'use client'

import { Text } from '@portal/ui/atoms'

export type ClassCardVariant = 'withBackground' | 'withoutBackground'

/** Campo em destaque no mobile/tablet (`tag` ou `title`). No desktop não tem efeito. */
export type ClassCardPrincipal = 'tag' | 'title'

const variantCard: Record<ClassCardVariant, string> = {
  withBackground:'grid lg:grid-cols-[3.5vw_15vw_6vw] grid-cols-[1fr] md:grid-rows-[1fr_1fr] grid-rows-[1fr] lg:grid-rows-[1fr] gap-2 bg-text-inverse rounded-lg p-4',
  withoutBackground:'grid lg:grid-cols-[5vw_25vw_10vw] grid-cols-[1fr] md:grid-rows-[1fr_1fr] grid-rows-[1fr] lg:grid-rows-[1fr] gap-2 '
}

export interface ClassCardItem {
  variant?: ClassCardVariant
  /**
   * Campo destacado no mobile/tablet: recebe `body-sm-emphasis` + `tone="brand"`,
   * enquanto os demais campos ficam `tone="secondary"`. No desktop (`lg+`) o card
   * é uniforme (tudo `brand`), então `principal` não tem efeito. Default `'tag'`.
   */
  principal?: ClassCardPrincipal
  tag: string
  title: string
  meta: string
}

/** Estilo de um campo num breakpoint: emphasis (peso do token) + tom de cor. */
type FieldStyle = { emphasis: boolean; tone: 'brand' | 'secondary' }

/**
 * Renderiza um campo do card. Como o emphasis vive dentro da `variant` do token
 * (não é utilitário responsivo), o tratamento mobile/tablet e o desktop saem em
 * dois `<Text>` alternados por breakpoint — cada um sempre com uma variant real.
 */
function CardField({
  value,
  mobile,
  desktop,
  className,
}: {
  value: string
  mobile: FieldStyle
  desktop: FieldStyle
  className?: string
}) {
  return (
    <>
      <Text
        variant={mobile.emphasis ? 'body-sm-emphasis' : 'body-sm'}
        tone={mobile.tone}
        className={['lg:hidden', className].filter(Boolean).join(' ')}
      >
        {value}
      </Text>
      <Text
        variant={desktop.emphasis ? 'body-sm-emphasis' : 'body-sm'}
        tone={desktop.tone}
        className={['hidden lg:block', className].filter(Boolean).join(' ')}
      >
        {value}
      </Text>
    </>
  )
}

export function ClassCard({tag,title,meta,variant,principal='tag'}:ClassCardItem){
  // Mobile/tablet: o campo `principal` destaca (brand+emphasis); os demais viram
  // secondary. Desktop: uniforme — tag em emphasis, title/meta normais, tudo brand.
  const secondary: FieldStyle = { emphasis: false, tone: 'secondary' }
  const highlight: FieldStyle = { emphasis: true, tone: 'brand' }

  return(
    <div className={variantCard[variant ?? 'withoutBackground']}>
      <div className='w-full col-start-1 self-center'>
        <CardField
          value={tag}
          mobile={principal === 'tag' ? highlight : secondary}
          desktop={{ emphasis: true, tone: 'brand' }}
          className='lg:text-center'
        />
      </div>
      <div className='w-full lg:col-start-2 md:row-start-2 lg:row-start-1 lg:self-center'>
        <CardField
          value={title}
          mobile={principal === 'title' ? highlight : secondary}
          desktop={{ emphasis: false, tone: 'brand' }}
          className='break-word lg:text-center lg:border-x-sm border-text-brand lg:px-2'
        />
      </div>
      <div className='w-full lg:col-start-3 self-center lg:text-center md:row-start-2 lg:row-start-1 row-start-3'>
        <CardField
          value={meta}
          mobile={secondary}
          desktop={{ emphasis: false, tone: 'brand' }}
        />
      </div>
    </div>
  )
}



