import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EditBlockedFieldsHint } from '../../src/components/molecules/EditBlockedFieldsHint'

describe('EditBlockedFieldsHint', () => {
  it('não renderiza quando blocked é false', () => {
    const html = renderToStaticMarkup(<EditBlockedFieldsHint blocked={false} />)
    expect(html).toBe('')
  })

  it('renderiza aviso quando blocked é true', () => {
    const html = renderToStaticMarkup(<EditBlockedFieldsHint blocked />)
    expect(html).toContain('Alguns campos ficam bloqueados')
    expect(html).toContain('após a publicação')
  })
})