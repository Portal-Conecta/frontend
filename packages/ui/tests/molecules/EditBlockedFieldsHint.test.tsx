import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EditBlockedFieldsHint } from '../../src/molecules/EditBlockedFieldsHint'

describe('EditBlockedFieldsHint', () => {
  it('does not render when the fields are not blocked', () => {
    const html = renderToStaticMarkup(<EditBlockedFieldsHint disabled={false} />)

    expect(html).toBe('')
  })

  it('renders a localized warning when fields are blocked', () => {
    const html = renderToStaticMarkup(<EditBlockedFieldsHint disabled />)

    expect(html).toContain('Alguns campos ficam bloqueados')
    expect(html).toContain('após a publicação')
  })
})
