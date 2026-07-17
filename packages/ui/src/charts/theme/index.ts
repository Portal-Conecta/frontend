export {
  DS_CATEGORICAL,
  DS_MAX_CATEGORIES,
  DS_STATUS_COLORS,
  assignSeriesColors,
  colorForEntity,
  type DsCategoricalColor,
} from './dsPalette'

export {
  DS_CHART_BRAND,
  dsBarDatasetDefaults,
  dsDoughnutDatasetDefaults,
  dsLineDatasetDefaults,
  makeDsChartOptions,
  readDsChartTheme,
  type DsChartKind,
  type DsChartOverrides,
  type DsChartTheme,
  type MakeDsChartOptionsConfig,
} from './dsChartTheme'

export {
  registerBarCharts,
  registerDoughnutCharts,
  registerLineCharts,
} from './registerChartJs'

export { useDsChartTheme } from './useDsChartTheme'
