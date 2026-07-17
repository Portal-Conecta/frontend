import type { StatsEntry } from '../../../types/dashboard'
import { DS_STATUS_COLORS } from '@portal/ui'

/** KPIs do topo — valores da referência de produto. */
export const DASHBOARD_KPIS = [
  {
    id: 'conformidade',
    label: 'Conformidade',
    value: '94,2%',
    hint: 'Média geral dos checklists',
    icon: 'circle-check' as const,
    tone: 'positive' as const,
  },
  {
    id: 'cumprimento',
    label: 'Cumprimento',
    value: '78,5%',
    hint: 'Checklists enviados no prazo',
    icon: 'clipboard-list' as const,
    tone: 'brand' as const,
  },
  {
    id: 'aderencia',
    label: 'Aderência',
    value: '88,9%',
    hint: 'Itens respondidos vs. esperados',
    icon: 'clipboard-list' as const,
    tone: 'brand' as const,
  },
  {
    id: 'falhas',
    label: 'Falhas Críticas',
    value: '4,3%',
    hint: 'Não conformidades graves',
    icon: 'triangle-alert' as const,
    tone: 'negative' as const,
  },
] as const

/** Tendência de conformidade (%) com meta 90%. */
export const TENDENCIA_CONFORMIDADE_LABELS = [
  'Sem 1',
  'Sem 2',
  'Sem 3',
  'Sem 4',
  'Sem 5',
  'Sem 6',
  'Sem 7',
  'Sem 8',
]

export const TENDENCIA_CONFORMIDADE_VALUES = [82, 84, 86, 87, 89, 91, 93, 94.2]
export const TENDENCIA_META = 90

/** Falhas por categoria. */
export const FALHAS_POR_CATEGORIA: StatsEntry[] = [
  { label: 'Tecnologia', value: 18 },
  { label: 'Montagem', value: 12 },
  { label: 'Organização', value: 7 },
]

/** Performance por turno — empilhado (ok / atenção / crítico). */
export const PERFORMANCE_TURNO_LABELS = ['Manhã', 'Tarde', 'Noite']
export const PERFORMANCE_TURNO_SERIES = [
  {
    key: 'ok',
    label: 'Conforme',
    color: DS_STATUS_COLORS.success,
    data: [72, 65, 58],
  },
  {
    key: 'atencao',
    label: 'Atenção',
    color: DS_STATUS_COLORS.warning,
    data: [18, 22, 24],
  },
  {
    key: 'critico',
    label: 'Crítico',
    color: DS_STATUS_COLORS.error,
    data: [10, 13, 18],
  },
] as const

export interface ZonaVermelhaIssue {
  id: string
  sala: string
  item: string
  categoria: string
  prioridade: 'HIGH' | 'MEDIUM' | 'LOW'
  turno: string
  abertoHa: string
}

export const ZONA_VERMELHA: ZonaVermelhaIssue[] = [
  {
    id: 'iss-1',
    sala: 'Lab. Eletrônica 02',
    item: 'Projetor sem imagem',
    categoria: 'Tecnologia',
    prioridade: 'HIGH',
    turno: 'Manhã',
    abertoHa: '2 dias',
  },
  {
    id: 'iss-2',
    sala: 'Sala 14',
    item: 'Bancada desnivelada',
    categoria: 'Montagem',
    prioridade: 'HIGH',
    turno: 'Tarde',
    abertoHa: '1 dia',
  },
  {
    id: 'iss-3',
    sala: 'Oficina CNC',
    item: 'EPIs fora do local',
    categoria: 'Organização',
    prioridade: 'MEDIUM',
    turno: 'Manhã',
    abertoHa: '5 h',
  },
  {
    id: 'iss-4',
    sala: 'Sala 07',
    item: 'Controle do ar-condicionado sem bateria',
    categoria: 'Tecnologia',
    prioridade: 'MEDIUM',
    turno: 'Noite',
    abertoHa: '3 dias',
  },
]

export const ALERTAS_ORIENTACAO = [
  {
    id: 'a1',
    title: 'Conferir checklist de chegada antes das 08h',
    description: 'Turmas do turno manhã com atraso recorrente no envio de ARRIVAL.',
  },
  {
    id: 'a2',
    title: 'Validar itens de Tecnologia em salas com lab.',
    description: 'Concentração de falhas em projetor, PC e controles nas últimas 2 semanas.',
  },
  {
    id: 'a3',
    title: 'Reforçar organização de bancadas pós-intervalo',
    description: 'POST_BREAK com não conformidades de organização acima da meta.',
  },
]
