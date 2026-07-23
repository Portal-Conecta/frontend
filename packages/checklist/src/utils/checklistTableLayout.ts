/**
 * Colunas desktop compartilhadas entre `ChecklistSubmissionCard` e
 * `ChecklistNonConformityCard` (cabeçalho + linhas das duas tabelas do
 * Monitor de Envios). Última coluna (botão) em largura fixa — não `auto` —
 * pra alinhar as duas tabelas: como os rótulos dos botões têm tamanhos
 * diferentes ("Ver Envio" vs "Ver Não Conformidade"), uma coluna `auto`
 * reservaria espaços diferentes em cada uma e desalinharia as colunas de
 * conteúdo entre as duas seções. Fonte única pra evitar as duas tabelas
 * desalinharem de novo se um valor mudar só de um lado (#526 review).
 */
export const CHECKLIST_TABLE_GRID_CLASS =
  "lg:grid-cols-[repeat(4,minmax(0,1fr))_11rem] lg:items-center lg:gap-x-6";

/** Largura da coluna de botão reservada no cabeçalho — mesmo valor do grid acima. */
export const CHECKLIST_TABLE_BUTTON_COLUMN_CLASS = "w-[11rem]";
