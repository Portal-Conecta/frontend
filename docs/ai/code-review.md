# Code Review por IA

O rubric completo de revisão de PR (taxonomia de severidade, checklist bloqueante, portões de governança, armadilhas específicas do projeto e contrato de output) mora em **[/REVISION.md](../../REVISION.md)**, na raiz do repositório — é o documento pensado para ser apontado diretamente por uma routine automatizada, por um agente com acesso ao repo, ou colado num chat sem acesso ao repo.

Antes de revisar um PR, o agente deve abrir também:

- [AGENTS.md](../../AGENTS.md) — mapa de camadas e regras de aprovação humana.
- `AGENTS.md` do domínio tocado (`packages/[domínio]/AGENTS.md`), se o PR mexe num domínio.
- A issue do PR — revise contra o "Pronto quando" dela, não contra gosto pessoal.

→ Para o fluxo inverso (IA implementando, não revisando), ver [como-usar-ia.md](como-usar-ia.md).
