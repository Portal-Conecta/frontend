# Operating Model - Squad Front / Design System

**Público:** todos. Explica por que este squad existe e como ele trabalha.

## Quem somos

Este squad é um time de plataforma. Os squads operacionais (Comunicados, Mapa de Salas, Checklist 5S) são times alinhados a fluxo que consomem o que produzimos. Nós não entregamos features de módulo; entregamos a capacidade de os squads entregarem mais rápido: Design System, layout compartilhado, padrões de UI/UX e acessibilidade.

## Estrela-guia

Nenhum squad operacional deveria ficar ocioso esperando por nós. A métrica não é o quanto produzimos nem o quanto parecemos ocupados; é maximizar a pista desobstruída dos squads contra um contrato estável. Se eles sempre têm o próximo passo claro e desbloqueado, não somos gargalo, mesmo estando à frente no grafo de dependência.

## Fronteira de propriedade

**Nós somos donos de:** design tokens, primitivos (`packages/ui`), o shell e layout compartilhado (AppLayout), padrões de interação e acessibilidade. O "como se parece e se comporta".

**Os squads são donos de:** compor os primitivos nas telas do módulo, lógica de negócio, data fetching e rotas internas do módulo. O "o que a tela faz".

A costura: o protótipo de alta fidelidade é o critério de aceite de uma tela; a API do DS é o contrato.

## Contrato-primeiro

Congelamos interfaces cedo (API dos componentes, nomes de token, props de layout) e deixamos a implementação visual amadurecer por baixo. Os squads codam contra interfaces estáveis, não contra pixel final. Toda task que destrava um squad expõe, sempre que possível, um contrato estável antes de a implementação estar polida.

## Governança em camadas

A governança é em camadas, não portão único:

- O mecânico (uso de token, proibição de cor/valor hardcoded, regras de estrutura) é enforçado por lint/CI, não por revisor humano.
- A revisão humana fica reservada para: mudança de token, novo componente compartilhado, alteração de acessibilidade e mudança em primitivo.
- A composição de primitivos existentes dentro de um módulo o squad faz e mescla sozinho. Revisão nunca pode virar o gargalo.

Ver [ADR-0010: Governança e CI como Portão](adr/ADR-0010-governanca-ci-como-portao.md).

## Caminho de promoção de componente

Quando um squad precisa de algo que não existe no DS, ele constrói local ao módulo, e há um caminho de promoção: se for reutilizável, revisamos e subimos para o DS. A plataforma cresce através dos consumidores, não apesar deles. Ver [creating-components](conventions/creating-components.md).

## Fonte única da verdade

- GitHub Projects é a fonte única de tasks e status.
- `docs/` e os ADRs são a fonte única de direção e decisões.
- Não recriar em markdown o que já vive como issue, PR ou board.
