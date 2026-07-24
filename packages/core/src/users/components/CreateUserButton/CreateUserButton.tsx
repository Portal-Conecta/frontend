/**
 * CreateUserButton — botão "Criar Novo Usuário": ícone-only no mobile, com
 * label no desktop (mesmo padrão do `comunicados`). Componente próprio pra
 * não duplicar o split responsivo entre `PageUsuariosContent` e o fallback
 * de loading (`UsersListFallback`) — já divergiu uma vez (#492 review: o
 * loading.tsx mostrava o botão com texto completo no mobile enquanto a
 * página real já tinha migrado pro ícone).
 */
import { Button } from '@portal/ui'

export interface CreateUserButtonProps {
  onClick?: () => void
}

export function CreateUserButton({ onClick }: CreateUserButtonProps) {
  return (
    <>
      <div className="md:hidden">
        <Button size="sm" icon="plus" aria-label="Criar novo usuário" onClick={onClick} />
      </div>
      <div className="hidden md:block">
        <Button iconLeft="plus" onClick={onClick}>
          Criar Novo Usuário
        </Button>
      </div>
    </>
  )
}

export default CreateUserButton
