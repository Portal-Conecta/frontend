# ADR-0010: Governança e CI como Portão

## Status
Aceita

## Data
2026-06-22

## Contexto

O squad de plataforma produz o contrato (DS, tokens, layout) que os squads operacionais consomem. Se toda mudança precisar de revisão humana do squad Front, viramos gargalo; se nada precisar, o Design System se corrompe. Precisávamos de um modelo que reserve a revisão humana para o que importa e deixe o resto mecânico.

## Decisão

Governança em camadas, não portão único:

- **Mecânico, via CI:** uso de token (ver [ADR-0009](ADR-0009-enforcement-de-token.md)), presença de story para componente novo e checagem de acessibilidade. Reprovado pelo CI, não por pessoa.
- **Revisão humana reservada para:** mudança de token, novo componente compartilhado, alteração de acessibilidade e mudança em primitivo. Operacionalizada por CODEOWNERS sobre `packages/ui`, `tokens`, `docs/adr` e `.github`, com branch protection exigindo CI verde e review de code owners.
- **Sem gate humano para:** composição de primitivos existentes dentro de um módulo; o squad mescla sozinho.

A implementação (CODEOWNERS, branch protection, time de review) é da issue #120; as checagens de CI são do grupo #101.

## Consequências

**Positivo:**
- A revisão humana foca em DS, tokens e acessibilidade, onde o custo de errar é alto.
- Os squads não esperam o Tech Lead para mergear composição de módulo.
- O modelo é explícito e versionado, não tribal.

**Negativo:**
- Depende de CODEOWNERS e branch protection bem configurados para o gate ser real.
- Exige que as checagens mecânicas existam e sejam confiáveis antes de afrouxar a revisão humana.

## Referências

- [ADR-0009: Enforcement de Token via Lint/CI](ADR-0009-enforcement-de-token.md)
- Issue #120: Governança de repositório
- Grupo #101: CI governança mecânica
