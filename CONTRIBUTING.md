# Guia de Contribuição - Portal Conecta

Este documento define as regras de contribuição que todos os membros devem seguir, independente do squad.

Em caso de dúvida, consulte a Scrum Master antes de realizar qualquer ação.

---

## Regras Gerais

- **Nunca** faça commit direto nas branches main ou dev**;**
- Todo código entra via Pull Request, nunca diretamente;
- PRs precisam de pelo menos 1 aprovação antes do merge.

---

## Git Flow - Estrutura das Branches

```
main        → código estável, versão de entrega
dev         → integração contínua, base para features
feature/    → desenvolvimento de funcionalidades
hotfix/     → correções urgentes em produção
release/    → preparação para entrega de sprint
```

### Fluxo padrão de trabalho

```
dev → feature/sua-branch → (PR aprovado) → dev → (fim de sprint) → main
```

---

## Nomenclatura de Branches

Use o padrão abaixo, sempre em letras minúsculas com hífen:

```
feature/42-autenticacao-email
feature/11-mapa-sala-aprendiz
hotfix/correcao-validacao-login
release/sprint-01
```

**Formato:** tipo/codigo-descricao-curta

| Tipo | Quando usar |
| --- | --- |
| feature/ | Nova funcionalidade |
| hotfix/ | Correção urgente em produção |
| release/ | Preparação de entrega |

---

## Padrão de Commits

Vamos seguir o padrão Conventional Commits:

```
tipo: descrição curta 
```

### Tipos permitidos

| Tipo | Quando usar |
| --- | --- |
| feat | Nova funcionalidade |
| fix | Correção de bug |
| docs | Documentação |
| refactor | Refatoração sem mudança de comportamento |
| style | Formatação, espaços, vírgulas (sem lógica) |
| test | Adição ou correção de testes |
| chore | Tarefas de configuração, dependências |

### Exemplos corretos

```
feat: adiciona filtro de comunicados por turma
fix: corrige bloqueio de login após 3 tentativas
docs: atualiza README com instruções de setup
refactor: extrai lógica de roles para service separado
```

### Exemplos incorretos (Evitem, por favor)

```
ajustes
corrigindo bug
wip
commit final
```

---

## Como Abrir um Pull Request

1. Certifique-se que sua branch está atualizada com a dev
2. Abra o PR com o título no mesmo formato do commit: feat: descrição
3. Preencha a descrição do PR com:
    - O que foi feito
    - Como testar
    - Issue relacionada (ex: Closes #42)
4. Aplique as labels corretas (squad, tipo, prioridade)
5. Solicite revisão do tech lead do seu squad
6. Aguarde aprovação, não faça merge sem aprovação

---

## Checklist antes de abrir PR (Façam a verificação)

- [ ]  Minha branch está atualizada com a dev
- [ ]  O código compila sem erros
- [ ]  Não subi arquivos desnecessários (.env, node_modules, target/)
- [ ]  Os commits seguem o padrão Conventional Commits
- [ ]  Apliquei as labels corretas na issue e no PR
- [ ]  A issue correspondente está como "Em revisão" no board

---

## Labels

Sempre aplique as labels corretas nas issues e PRs:

| Label | Significado |
| --- | --- |
| priority: high | Prioridade alta  |
| priority: medium | Prioridade média |
| priority: low | Prioridade baixa |
| bug | Algo não está funcionando |
| enhancement | Melhoria ou nova funcionalidade |
| blocked | Issue travada por dependência externa |
| squad: * | Squad responsável pela issue |

---

## Dúvidas?

Scrum Master 78: Victória

Scrum Master 77: Melissa

No caso de dúvidas, sintam-se a vontade para perguntar!!
