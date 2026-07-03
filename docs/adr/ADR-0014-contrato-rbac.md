# ADR-0014: Contrato de RBAC (papéis × permissões)

## Status
Aceita

## Data
2026-07-02

## Contexto

A Sidebar dinâmica, as páginas de erro (403) e os guards de rota (História D,
[#159](https://github.com/Portal-Conecta/frontend/issues/159)) precisam saber
_quem é o usuário_ e _o que ele pode_. A investigação do backend real revelou que
o contrato que as issues [#171](https://github.com/Portal-Conecta/frontend/issues/171)
e [#172](https://github.com/Portal-Conecta/frontend/issues/172) assumiam **não existe**:

- **Não há `/me` de perfil.** O único endpoint sob `/me` é `GET /me/courses` (matrículas
  acadêmicas). Nome/email/tipo vivem em `GET /users/{id}`.
- **RBAC é implícito nos claims do JWT:** `sub` (userId), `userType` (papel global) e
  `classes: [{classId, role}]` (papel por matrícula). Extraídos do token, sem consulta ao BD.
- **Não há lista de permissões servida.** A matriz "quem pode o quê" é hardcoded em
  validators Java (allow-lists de `userType`); a autorização é aplicada manualmente nos
  use cases, que lançam 403. `@PreAuthorize`/`ROLE_<TypeUser>` existem mas estão mortos.

Sem um contrato estável, cada domínio decodificaria o token e reimplementaria as regras,
gerando fontes da verdade divergentes. Precisávamos **congelar** um contrato — mesmo que o
backend não o sirva pronto.

## Decisão

O **BFF monta** o contrato de RBAC (não faz proxy). No servidor, decodifica os claims do
JWT e aplica uma tabela papel→permissão, entregando ao front um objeto único e estável — o
`CurrentUser` — exposto por `@portal/core`.

**Formato congelado** (`packages/core/src/rbac/types.ts`):

```ts
type TypeUser  = 'STUDENT' | 'REPRESENTATIVE' | 'TEACHER' | 'SENAI' | 'WEG' | 'ADMIN'
type ClassRole = 'STUDENT' | 'TEACHER' | 'REPRESENTATIVE'
type Permission =
  | 'comunicados:ver' | 'mapa:ver' | 'checklist:ver'
  | 'usuarios:listar' | 'usuarios:gerenciar'
  | 'salas:gerenciar' | 'cursos:gerenciar' | 'turmas:gerenciar'
  | 'matriculas:gerenciar'

interface CurrentUser {
  id: string
  userType: TypeUser
  classes: { classId: string; role: ClassRole }[]
  permissions: Permission[]   // resolvido no servidor pela tabela
}
```

**Tudo é permissão.** Inclusive visibilidade de módulo/nav (`:ver`), para que Sidebar,
guards e 403 usem o mesmo mecanismo `can(user, permission)`. A tabela papel→permissão
(`rolePermissions.ts`) é a **fonte única** no front, espelhando as allow-lists do backend.

**Duas dimensões.** `userType` (global) resolve `permissions`; `ClassRole` (por turma) é
escopo para checagens `por turma` (ex.: professor da turma X edita o mapa da turma X).

**Front é UX; backend é o gate.** Esconder um item é conforto visual — o 403 do backend é a
fronteira real. Divergência da tabela degrada UX, não segurança.

**Perfil é adiado.** `CurrentUser` não inclui nome/email. Quando a issue de header/perfil
chegar, o montador (`getCurrentUser`) enriquece com `GET /users/{id}` no mesmo objeto — sem
mudar consumidores.

## Consequências

**Positivo:**
- Um contrato estável desacopla todos os consumidores (Sidebar, erro, guards, domínios) da
  bagunça do backend. Quando o back servir a matriz, só o montador do BFF muda.
- Um único mecanismo (`can`) e uma única tabela editável — mudar uma regra é trocar uma célula.
- O token bruto nunca cruza para o client; só o `CurrentUser` derivado (que não é segredo).

**Negativo:**
- A matriz de permissões fica **duplicada** (front espelha o Java). Mitigado por ser UX-only e
  por concentrar tudo numa tabela; deve ser eliminada quando o backend expuser as permissões.
- Os direitos ficam "congelados" pela vida do access token (~15 min); recomputam no refresh.
- O front assume os nomes dos claims (`sub`, `userType`, `classes`) — a validar contra o token
  real de login.

## Referências

- [ADR-0004: Arquitetura em Camadas](ADR-0004-arquitetura-em-camadas.md)
- [ADR-0012: Contrato do AppLayout](ADR-0012-contrato-do-applayout.md)
- Issues [#171](https://github.com/Portal-Conecta/frontend/issues/171) · [#172](https://github.com/Portal-Conecta/frontend/issues/172) · [#159](https://github.com/Portal-Conecta/frontend/issues/159)
- `packages/core/src/rbac/`
