# Documentação - Portal Conecta Frontend

Ponto de entrada da documentação. Comece por aqui para saber onde achar cada coisa.

## Mapa

| Onde | O quê | Quando ler |
|---|---|---|
| [operating-model.md](operating-model.md) | **Porquê** existimos como squad de plataforma: fronteira de propriedade e estrela-guia. | Para entender o modelo de trabalho e quem é dono do quê. |
| [adr/](adr/README.md) | **Porquê** das decisões: os Architecture Decision Records. | Antes de questionar ou mudar uma decisão arquitetural. |
| [conventions/](conventions/) | **Como** implementar: tokens, layout, código e acessibilidade. | No dia a dia, ao construir telas e componentes. |
| [ai/](ai/) | **Guardrails** para agentes de código: context pack, definition of done e uso de IA. | Antes de delegar trabalho a um agente. |

## Convenções

- [tokens-e-theming](conventions/tokens-e-theming.md) - nunca hardcode; tokens do DS.
- [layout-e-paginas](conventions/layout-e-paginas.md) - uso do AppLayout.
- [code-style](conventions/code-style.md) - App Router, data fetching, estado, naming.
- [acessibilidade](conventions/acessibilidade.md) - foco, ARIA, contraste, movimento.
- [creating-components](conventions/creating-components.md) - autoria de componentes do DS (plataforma).

## Raiz do repositório

- [AGENTS.md](../AGENTS.md) - ponto de entrada para agentes e desenvolvedores.
- [CONTRIBUTING.md](../CONTRIBUTING.md) - versionamento, branches e PRs.
