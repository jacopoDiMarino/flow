import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ContiService } from '../../services/conti.service';
import { Conto } from '../../models/conto';
import { TipologiaConto } from '../../enums/tipologiaConto.enum';
import { Fornitore } from '../../models/fornitore';
import { FornitoriService } from '../../services/fornitori.service';

@Component({
  selector: 'app-dashboard-conti',
  standalone: true,
  templateUrl: './statisticheConti.component.html',
  styleUrls: ['./statisticheConti.component.scss'],
  imports: [CommonModule, ChartModule, CardModule],
})
export class StatisticheContiComponent implements OnInit {
  conti: Conto[] = [];

  acquistiChartData: any;
  pagamentiChartData: any;
  chartOptions: any;

  totaleAcquisti = 0;
  totalePagamenti = 0;
  totaleDebito = 0;
  monthlyTrendChartData: any;
  monthlyTrendChartOptions: any;

  constructor(
    private contiService: ContiService,
    private fornitoriService: FornitoriService,
  ) {}

  ngOnInit(): void {
    this.conti = this.contiService.conti.getValue();

    this.generaTotali();
    this.generaDatiGrafici();
    this.prepareMonthlyTrendChart(this.conti);
    this.prepareDistribuzioneSpeseFornitoriChart(
      this.conti,
      this.fornitoriService.fornitori.getValue(),
    );
    this.preparePrevisioneCashFlowChart(this.conti);
    this.createCrescitaSpeseChart(this.conti);
    this.prepareDebitoNettoMensileChart(this.conti);
    this.prepareSeasonalAnalysisChart(this.conti);
  }
  seasonalChartData: any;
  seasonalChartOptions: any;
  prepareSeasonalAnalysisChart(conti: Conto[]) {
    const anni = Array.from(
      new Set(conti.map((c) => new Date(c.dataOperazione).getFullYear())),
    ).sort();
    const mesiLabels = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('it-IT', { month: 'short' }),
    );

    // Dati: per ogni anno, array 12 mesi con somma acquisti
    const datasets = anni.map((anno) => {
      const datiMese = Array(12).fill(0);
      conti.forEach((c) => {
        const data = new Date(c.dataOperazione);
        if (
          data.getFullYear() === anno &&
          (c.tipologia === 'ACQUISTO' || c.tipologia === 'RIMBORSO')
        ) {
          const mese = data.getMonth();
          const valore = c.tipologia === 'RIMBORSO' ? -c.importo : c.importo;
          datiMese[mese] += valore;
        }
      });

      const colori = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']; // espandi se servono più anni

      return {
        label: anno.toString(),
        data: datiMese,
        borderColor: colori[anni.indexOf(anno) % colori.length],
        fill: false,
        tension: 0.3,
      };
    });

    this.seasonalChartData = {
      labels: mesiLabels,
      datasets,
    };

    this.seasonalChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };
  }

  debitoNettoChartData: any;
  debitoNettoChartOptions: any;
  prepareDebitoNettoMensileChart(conti: Conto[]) {
    const today = new Date();
    const labels: string[] = [];
    const debitoNettoData: number[] = [];

    // Ultimi 12 mesi, da 11 mesi fa fino a questo mese
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('it-IT', { month: 'short' }));

      const da = new Date(date.getFullYear(), date.getMonth(), 1);
      const a = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const acquistiTot = conti
        .filter((c) => {
          const d = new Date(c.dataOperazione);
          return (
            d >= da &&
            d <= a &&
            (c.tipologia === 'ACQUISTO' || c.tipologia === 'RIMBORSO')
          );
        })
        .reduce(
          (sum, c) =>
            sum + (c.tipologia === 'RIMBORSO' ? -c.importo : c.importo),
          0,
        );

      const pagamentiTot = conti
        .filter((c) => {
          const d = new Date(c.dataOperazione);
          return d >= da && d <= a && c.tipologia === 'PAGAMENTO';
        })
        .reduce((sum, c) => sum + c.importo, 0);

      debitoNettoData.push(acquistiTot - pagamentiTot);
    }

    this.debitoNettoChartData = {
      labels,
      datasets: [
        {
          label: 'Debito netto mensile',
          data: debitoNettoData,
          fill: true,
          backgroundColor: 'rgba(239, 68, 68, 0.2)', // rosso chiaro
          borderColor: '#ef4444', // rosso
          tension: 0.3,
        },
      ],
    };

    this.debitoNettoChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };
  }

  calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
      const window = data.slice(i, i + windowSize);
      const avg = window.reduce((a, b) => a + b, 0) / windowSize;
      result.push(avg);
    }
    return result;
  }
  previsioneCashFlowChartData: any;
  previsioneCashFlowChartOptions: any;
  preparePrevisioneCashFlowChart(conti: Conto[]) {
    const today = new Date();
    const monthsCount = 12;
    const labels: string[] = [];
    const netCashFlow: number[] = [];

    // Calcola cash flow reale (uscite di cassa negative) per mese negli ultimi 12 mesi
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('it-IT', { month: 'short' }));

      const da = new Date(date.getFullYear(), date.getMonth(), 1);
      const a = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const pagamenti = conti
        .filter((c) => {
          const d = new Date(c.dataOperazione);
          return d >= da && d <= a && c.tipologia === 'PAGAMENTO';
        })
        .reduce((sum, c) => sum + c.importo, 0);

      const rimborsi = conti
        .filter((c) => {
          const d = new Date(c.dataOperazione);
          return d >= da && d <= a && c.tipologia === 'RIMBORSO';
        })
        .reduce((sum, c) => sum + c.importo, 0);

      const net = -(pagamenti + rimborsi); // uscita cassa negativa
      netCashFlow.push(net);
    }

    // Calcola media mobile a 3 mesi
    const mediaMobile = this.calculateMovingAverage(netCashFlow, 3);

    // Prossimi 3 mesi: previsione uguale all’ultimo valore media mobile
    const previsioneLabels: string[] = [];
    const previsioneData: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      previsioneLabels.push(
        futureDate.toLocaleDateString('it-IT', { month: 'short' }),
      );
      previsioneData.push(mediaMobile[mediaMobile.length - 1]);
    }

    this.previsioneCashFlowChartData = {
      labels: [...labels, ...previsioneLabels],
      datasets: [
        {
          label: 'Flusso di cassa storico',
          data: [...netCashFlow, ...Array(previsioneData.length).fill(null)], // storico + null per previsione
          fill: false,
          borderColor: '#2563eb', // blu
          tension: 0.4,
        },
        {
          label: 'Previsione',
          data: [...Array(netCashFlow.length).fill(null), ...previsioneData], // null per storico + dati previsione
          fill: false,
          borderColor: '#f59e0b', // arancione
          borderDash: [5, 5], // linea tratteggiata
          tension: 0.4,
        },
      ],
    };

    this.previsioneCashFlowChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        y: { beginAtZero: false }, // può scendere sotto zero
      },
    };
  }

  crescitaSpeseChartData: any;
  crescitaSpeseChartOptions: any;
  createCrescitaSpeseChart(conti: Conto[]) {
    const today = new Date();
    const labels: string[] = [];
    const crescitaPercentuale: number[] = [];

    // Calcolo importi mese per mese per gli ultimi 12 mesi
    const importiMensili: number[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('it-IT', { month: 'short' }));

      const da = new Date(date.getFullYear(), date.getMonth(), 1);
      const a = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const totaleAcquisti = conti
        .filter(
          (c) =>
            new Date(c.dataOperazione) >= da &&
            new Date(c.dataOperazione) <= a &&
            (c.tipologia === 'ACQUISTO' || c.tipologia === 'RIMBORSO'),
        )
        .reduce(
          (sum, c) =>
            sum + (c.tipologia === 'RIMBORSO' ? -c.importo : c.importo),
          0,
        );

      importiMensili.push(totaleAcquisti);
    }

    // Calcola % crescita mese su mese
    for (let i = 1; i < importiMensili.length; i++) {
      const prev = importiMensili[i - 1];
      const curr = importiMensili[i];
      const crescita = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
      crescitaPercentuale.push(parseFloat(crescita.toFixed(2)));
    }

    // La prima label non ha crescita, mettiamo empty o zero
    labels.shift();

    this.crescitaSpeseChartData = {
      labels,
      datasets: [
        {
          label: '% Crescita Acquisti Mese-su-Mese',
          data: crescitaPercentuale,
          fill: false,
          borderColor: '#ef4444', // rosso
          backgroundColor: '#ef4444',
          tension: 0.3,
        },
      ],
    };

    this.crescitaSpeseChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ctx.parsed.y + '%',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val: any) => val + '%',
          },
        },
      },
    };
  }

  distribuzioneSpeseFornitoriChartData: any;
  distribuzioneSpeseFornitoriChartOptions: any;

  prepareDistribuzioneSpeseFornitoriChart(
    conti: Conto[],
    fornitori: Fornitore[],
  ) {
    const speseMap = new Map<string, number>();

    conti.forEach((c) => {
      if (c.tipologia === TipologiaConto.ACQUISTO) {
        speseMap.set(
          c.idFornitore,
          (speseMap.get(c.idFornitore) || 0) + c.importo,
        );
      } else if (c.tipologia === TipologiaConto.RIMBORSO) {
        speseMap.set(
          c.idFornitore,
          (speseMap.get(c.idFornitore) || 0) - c.importo,
        );
      }
    });

    // Mappa idFornitore → nome
    const labels = Array.from(speseMap.keys()).map((id) => {
      const f = fornitori.find((f) => f.id === id);
      return f ? f.ragioneSociale : id;
    });

    const data = Array.from(speseMap.values());

    this.distribuzioneSpeseFornitoriChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map(() => this.randomColor()),
        },
      ],
    };

    this.distribuzioneSpeseFornitoriChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: (context: any) =>
              `${context.label}: ${context.parsed} € (${(
                (context.parsed /
                  data.reduce((a: number, b: number) => a + b, 0)) *
                100
              ).toFixed(2)}%)`,
          },
        },
      },
    };
  }

  randomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  }

  prepareMonthlyTrendChart(conti: Conto[]) {
    const today = new Date();
    const labels: string[] = [];
    const acquistiData: number[] = [];
    const pagamentiData: number[] = [];
    const rimborsiData: number[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('it-IT', { month: 'short' }));

      const da = new Date(date.getFullYear(), date.getMonth(), 1);
      const a = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const acquistiTot = conti
        .filter((c) => {
          const d = new Date(c.dataOperazione);
          return d >= da && d <= a && c.tipologia === TipologiaConto.ACQUISTO;
        })
        .reduce((sum, c) => sum + c.importo, 0);

      const pagamentiTot = conti
        .filter((c) => {
          const d = new Date(c.dataOperazione);
          return d >= da && d <= a && c.tipologia === TipologiaConto.PAGAMENTO;
        })
        .reduce((sum, c) => sum + c.importo, 0);

      const rimborsiTot = conti
        .filter((c) => {
          const d = new Date(c.dataOperazione);
          return d >= da && d <= a && c.tipologia === TipologiaConto.RIMBORSO;
        })
        .reduce((sum, c) => sum + c.importo, 0);

      acquistiData.push(acquistiTot);
      pagamentiData.push(pagamentiTot);
      rimborsiData.push(rimborsiTot);
    }

    this.monthlyTrendChartData = {
      labels,
      datasets: [
        {
          label: 'Acquisti',
          data: acquistiData,
          fill: false,
          borderColor: '#3b82f6',
          tension: 0.4,
        },
        {
          label: 'Pagamenti',
          data: pagamentiData,
          fill: false,
          borderColor: '#22c55e',
          tension: 0.4,
        },
        {
          label: 'Rimborsi',
          data: rimborsiData,
          fill: false,
          borderColor: '#f59e0b',
          tension: 0.4,
        },
      ],
    };

    this.monthlyTrendChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };
  }

  generaTotali() {
    this.totaleAcquisti = this.conti
      .filter((c) => c.tipologia === TipologiaConto.ACQUISTO)
      .reduce((s, c) => s + c.importo, 0);

    this.totalePagamenti = this.conti
      .filter((c) => c.tipologia === TipologiaConto.PAGAMENTO)
      .reduce((s, c) => s + c.importo, 0);

    this.totaleDebito = this.totaleAcquisti - this.totalePagamenti;
  }

  generaDatiGrafici() {
    const mesi = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('it-IT', { month: 'short' }).toUpperCase();
    }).reverse();

    const acquistiMensili = new Array(12).fill(0);
    const pagamentiMensili = new Array(12).fill(0);

    for (const c of this.conti) {
      const data = new Date(c.dataOperazione);
      const diffMesi = this.getDifferenzaMesi(data, new Date());

      if (diffMesi >= 0 && diffMesi < 12) {
        const idx = 11 - diffMesi;
        if (c.tipologia === TipologiaConto.ACQUISTO) {
          acquistiMensili[idx] += c.importo;
        } else if (c.tipologia === TipologiaConto.PAGAMENTO) {
          pagamentiMensili[idx] += c.importo;
        }
      }
    }

    this.acquistiChartData = {
      labels: mesi,
      datasets: [
        {
          label: 'Acquisti',
          backgroundColor: '#42A5F5',
          data: acquistiMensili,
        },
      ],
    };

    this.pagamentiChartData = {
      labels: mesi,
      datasets: [
        {
          label: 'Pagamenti',
          backgroundColor: '#66BB6A',
          data: pagamentiMensili,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#495057' } },
      },
      scales: {
        x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
        y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
      },
    };
  }

  private getDifferenzaMesi(data: Date, ref: Date): number {
    const anni = ref.getFullYear() - data.getFullYear();
    const mesi = ref.getMonth() - data.getMonth();
    return anni * 12 + mesi;
  }
}
