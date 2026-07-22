/**
 * Linha de membro da turma — glyph `circle-user` de 32px + nome. É o mesmo
 * "Card usuários" do Figma nos dois lugares onde aparece: a lista das abas e o
 * painel de representantes.
 *
 * Não usa o átomo `Avatar` de propósito: ele é fixo em 80px com `strokeWidth`
 * calibrado para esse tamanho (uso do perfil), enquanto aqui o design pede o
 * glyph de 32px do set normal — que é exatamente o `Icon size="lg"`.
 */
import { Icon, ListItem, Text } from '@portal/ui'

import type { ClassMember } from './types'

export interface ClassMemberRowProps {
  member: ClassMember
}

export function ClassMemberRow({ member }: ClassMemberRowProps) {
  return (
    <li>
      {/* px/py sobrescrevem o `p-4` do ListItem para bater com o Figma (12px). */}
      <ListItem disableHover className="flex items-center gap-3 px-3 py-3">
        <Icon name="circle-user" size="lg" decorative className="shrink-0 text-text-brand" />
        <Text as="span" variant="label-sm" tone="brand" className="min-w-0 flex-1 break-words">
          {member.name}
        </Text>
      </ListItem>
    </li>
  )
}
