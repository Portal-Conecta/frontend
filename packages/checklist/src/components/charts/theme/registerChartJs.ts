/**
 * Registro tree-shaken do Chart.js — importe só o que o gráfico usa.
 *
 * Ex.: `registerBarCharts()` em um componente de barras.
 */
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

let barRegistered = false;
let lineRegistered = false;
let doughnutRegistered = false;

export function registerBarCharts(): void {
  if (barRegistered) return;
  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
  barRegistered = true;
}

export function registerLineCharts(): void {
  if (lineRegistered) return;
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
  );
  lineRegistered = true;
}

export function registerDoughnutCharts(): void {
  if (doughnutRegistered) return;
  ChartJS.register(ArcElement, Tooltip, Legend);
  doughnutRegistered = true;
}
