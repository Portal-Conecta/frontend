import { describe, expect, it } from 'vitest'

import {
  EDIT_BLOCKED_FIELDS_HINT_MESSAGE,
  shouldShowEditBlockedFieldsHint,
} from '../../src/components/EditBlockedFieldsHint/editBlockedFieldsHintMessage'

describe('EditBlockedFieldsHint', () => {
  it('não exibe aviso quando blocked é false', () => {
    expect(shouldShowEditBlockedFieldsHint(false)).toBe(false)
    expect(shouldShowEditBlockedFieldsHint()).toBe(false)
  })

  it('exibe aviso quando blocked é true', () => {
    expect(shouldShowEditBlockedFieldsHint(true)).toBe(true)
  })

  it('mensagem explica bloqueio após publicação', () => {
    expect(EDIT_BLOCKED_FIELDS_HINT_MESSAGE).toContain('bloqueados')
    expect(EDIT_BLOCKED_FIELDS_HINT_MESSAGE).toContain('publicação')
    expect(EDIT_BLOCKED_FIELDS_HINT_MESSAGE).toContain('agendar')
  })
})
