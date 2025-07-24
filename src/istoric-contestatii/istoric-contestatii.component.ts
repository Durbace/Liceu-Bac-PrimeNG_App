import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { Chart } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartDataset } from 'chart.js';

import { ContestatiiService } from '../services/contestatii.service';
import { Contestatie } from '../services/contestatii.service';

@Component({
  selector: 'app-istoric-contestatii',
  templateUrl: './istoric-contestatii.component.html',
  styleUrls: ['./istoric-contestatii.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    NgChartsModule,
  ],
})
export class IstoricContestatiiComponent implements OnInit {
  years: SelectItem[] = [];
  judete: SelectItem[] = [];
  subjects: SelectItem[] = [];

  selectedYear: SelectItem | null = null;
  selectedJudet: SelectItem | null = null;
  selectedSubject: SelectItem | null = null;

  filtreActive: string[] = [];

  chartData: ChartDataset<'line', number[]>[] = [];
  chartLabels: string[] = [];
  chartOptions: ChartOptions = {};
  chartType: 'line' = 'line';

  total: number = 0;
  noteCrescute: number = 0;
  noteScazute: number = 0;
  noteNeschimbate: number = 0;
  diferentaMedie: number = 0;
  afiseazaStatistici: boolean = false;

  deviationChartData: ChartDataset<'bar', number[]>[] = [];
  deviationChartLabels: string[] = [];
  deviationChartOptions: ChartOptions = {};
  deviationChartType: 'bar' = 'bar';

  constructor(private contestatiiService: ContestatiiService) {}

  ngOnInit(): void {
    this.years = [
      { label: '2023', value: 2023 },
      { label: '2024', value: 2024 },
    ];

    this.subjects = [
      {
        label: 'Limba și literatura română',
        value: 'Limba și literatura română',
      },
      { label: 'Matematică', value: 'Matematică' },
    ];

    this.contestatiiService.getJudete().subscribe({
      next: (judete) => {
        this.judete = judete.map((j: { label: string; value: string }) => ({
          label: j.label,
          value: j.value,
        }));
      },
      error: (err) => {
        console.error('Eroare la incarcarea judetelor:', err);
        this.judete = [];
      },
    });

    this.initChartOptions();
  }

  onYearChange(item: SelectItem) {
    this.selectedYear = item;
    this.updateActiveFilters();
    this.loadChartData();
  }

  onJudetChange(item: SelectItem) {
    this.selectedJudet = item;
    this.updateActiveFilters();
    this.loadChartData();
  }

  onSubjectChange(item: SelectItem) {
    this.selectedSubject = item;
    this.updateActiveFilters();
    this.loadChartData();
  }

  adaugaFiltru() {
    this.updateActiveFilters();
    this.loadChartData();
  }

  curataFiltre() {
    this.selectedYear = null;
    this.selectedJudet = null;
    this.selectedSubject = null;
    this.filtreActive = [];
    this.loadChartData();
  }

  private updateActiveFilters() {
    this.filtreActive = [];
    if (this.selectedYear != null) {
      this.filtreActive.push(`An: ${this.selectedYear}`);
    }
    if (this.selectedJudet) {
      this.filtreActive.push(`Județ: ${this.selectedJudet}`);
    }
    if (this.selectedSubject) {
      const label =
        this.subjects.find((s) => s.value === this.selectedSubject)?.label ??
        '';
      this.filtreActive.push(`Materie: ${label}`);
    }
  }

  private initChartOptions() {
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: false,
            boxWidth: 30,
            boxHeight: 12,
            padding: 16,
            generateLabels: (chart: any) =>
              (
                Chart.defaults.plugins.legend.labels.generateLabels(
                  chart
                ) as any[]
              ).map((label: any) => ({
                ...label,
                hidden: !chart.isDatasetVisible(label.datasetIndex!),
              })),
          },
          onClick: (_e, legendItem, legend) => {
            const chart = legend.chart as any;
            const idx = legendItem.datasetIndex!;
            const hidden = !chart.isDatasetVisible(idx);
            chart.setDatasetVisibility(idx, hidden);
            chart.update();
          },
        },
        tooltip: { mode: 'index', intersect: false },
        title: {
          display: true,
          text: `Evoluția notelor pentru ${this.selectedSubject?.label} (${this.selectedYear?.label})`,
        },
      },
      scales: {
        x: { display: true, title: { display: true, text: 'ID elev' } },
        y: {
          display: true,
          title: { display: true, text: 'Notă' },
          min: 1,
          max: 10,
        },
      },
    };

    this.deviationChartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Devierea față de nota inițială (ra - ri)',
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y as number;
              return ` Deviație: ${val.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: { display: true, title: { display: true, text: 'ID elev' } },
        y: {
          display: true,
          title: { display: true, text: '(ra - ri)' },
          suggestedMin: -1,
          suggestedMax: 1.5,
        },
      },
    };
  }

  private loadChartData() {
    if (
      this.selectedYear === null ||
      this.selectedJudet === null ||
      this.selectedSubject === null
    ) {
      this.chartData = [];
      this.chartLabels = [];
      this.deviationChartData = [];
      this.deviationChartLabels = [];
      this.afiseazaStatistici = false;
      return;
    }

    const year = this.selectedYear.value as number;
    const judet = this.selectedJudet.value as string;
    const subjectLabel = this.selectedSubject.label;

    this.contestatiiService.getContestatii(year, judet).subscribe({
      next: (data: Contestatie[]) => {
        const noteMaterie = data.filter((d) => d.materie === subjectLabel);

        const valide = noteMaterie
          .filter((d) => d.id != null)
          .sort((a, b) => a.notaInitiala - b.notaInitiala);

        this.total = valide.length;
        this.noteCrescute = valide.filter((d) => d.diferenta > 0).length;
        this.noteScazute = valide.filter((d) => d.diferenta < 0).length;
        this.noteNeschimbate = valide.filter((d) => d.diferenta === 0).length;
        const sumaDiferente = valide.reduce((sum, d) => sum + d.diferenta, 0);
        this.diferentaMedie = this.total > 0 ? sumaDiferente / this.total : 0;

        this.chartLabels = valide.map((d) => d.id);
        this.chartData = [
          {
            label: 'Nota inițială',
            data: valide.map((d) => d.notaInitiala),
            fill: false,
            tension: 0.1,
          },
          {
            label: 'Nota după contestație',
            data: valide.map((d) => d.notaDupaContestatie),
            fill: false,
            tension: 0.1,
          },
        ];
        this.chartOptions = {
          ...this.chartOptions,
          plugins: {
            ...this.chartOptions.plugins,
            title: {
              display: true,
              text: `Evoluția notelor pentru ${subjectLabel} (${year})`,
            },
          },
        };

        this.deviationChartLabels = valide.map((d) => d.id);
        this.deviationChartData = [
          {
            label: 'Deviație (ra - ri)',
            data: valide.map((d) => d.diferenta),
            backgroundColor: valide.map((d) =>
              d.diferenta >= 0 ? 'green' : 'red'
            ),
            borderWidth: 0,
          },
        ];

        this.afiseazaStatistici = true;
      },

      error: () => {
        this.chartData = [];
        this.chartLabels = [];
        this.deviationChartData = [];
        this.deviationChartLabels = [];
        this.afiseazaStatistici = false;
      },
    });
  }
}
