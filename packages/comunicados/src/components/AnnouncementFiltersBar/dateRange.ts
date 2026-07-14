/**
 * Regra do intervalo de datas do filtro do mural.
 *
 * Datas no formato nativo do input (`yyyy-mm-dd`), onde a comparação
 * lexicográfica já equivale à cronológica — por isso `<` basta, sem construir
 * `Date` (que reintroduziria fuso horário num dado que é calendário civil puro).
 *
 * Intervalo invertido (final antes da inicial) não retorna nada do backend. Em
 * vez de recusar a entrada ou deixar o filtro sair quebrado, o campo que o
 * usuário acabou de mexer é puxado até o outro — as duas datas se igualam e o
 * intervalo vira um único dia. O `min`/`max` do input já barra isso pelo
 * calendário; estas funções cobrem a digitação, que o browser aceita e apenas
 * marca como fora de faixa.
 *
 * Campo vazio é entrada legítima (intervalo em aberto) e passa intacto.
 */

/** Data final anterior à inicial → iguala à inicial. */
export function clampDataFim(dataFim: string, dataInicio: string): string {
  if (!dataFim || !dataInicio) return dataFim
  return dataFim < dataInicio ? dataInicio : dataFim
}

/** Data inicial posterior à final → iguala à final. */
export function clampDataInicio(dataInicio: string, dataFim: string): string {
  if (!dataInicio || !dataFim) return dataInicio
  return dataInicio > dataFim ? dataFim : dataInicio
}
