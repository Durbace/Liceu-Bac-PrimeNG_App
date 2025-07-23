import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
// Ng2-Charts imports
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
  // filter options
  years: SelectItem[] = [];
  judete: SelectItem[] = [];
  subjects: SelectItem[] = [];

  // selected filters
  selectedYear: SelectItem | null = null;
  selectedJudet: SelectItem | null = null;
  selectedSubject: SelectItem | null = null;

  // active filters display
  filtreActive: string[] = [];

  // chart data placeholders
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

  constructor(private contestatiiService: ContestatiiService) {}

  ngOnInit(): void {
    // initialize years and subjects
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

    // încarcă județele din backend
    this.contestatiiService.getJudete().subscribe({
      next: (judete) => {
        this.judete = judete.map((j: { label: string; value: string }) => ({
          label: j.label,
          value: j.value,
        }));
      },
      error: (err) => {
        console.error('Eroare la încărcarea județelor:', err);
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
        legend: { position: 'bottom' },
        tooltip: { mode: 'index', intersect: false },
        title: {
          display: true,
          text: `Evoluția notelor pentru ${this.selectedSubject?.label} (${this.selectedYear?.label})`,
        },
      },
      scales: {
        x: {
          display: true,
          title: { display: true, text: 'ID elev' }, // ← aici
        },
        y: {
          display: true,
          title: { display: true, text: 'Notă' },
          min: 1,
          max: 10,
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
      this.afiseazaStatistici = false;
      return;
    }

    const year = this.selectedYear!.value as number;
    const judet = this.selectedJudet!.value as string;
    const subject = this.selectedSubject!.value as string;

    this.contestatiiService.getContestatii(year, judet).subscribe({
  next: (data: Contestatie[]) => {
    console.log('API data:', data);

    // folosește label-ul, nu value-ul, dacă API-ul îți trimite „materie” ca textul complet
    const subjectLabel = this.selectedSubject!.label;
    console.log('Filtrăm după materie:', subjectLabel);

    const noteMaterie = data.filter(d => d.materie === subjectLabel);
    console.log('După filter:', noteMaterie);

    const valide = noteMaterie
      .filter(d => d.id != null)
      .sort((a, b) => ('' + a.id).localeCompare('' + b.id));
    console.log('După sort și validare:', valide);

        // 3) axa X = lista de ID‐uri
        this.chartLabels = valide.map((d) => d.id + '');

        // 4) două serii: nota inițială și nota după
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
              text: `Evoluția notelor pentru ${this.selectedSubject!.label} (${
                this.selectedYear!.label
              })`,
            },
          },
        };

        this.afiseazaStatistici = true;
      },
      error: (err) => {
        console.error(err);
        this.chartData = [];
        this.chartLabels = [];
        this.afiseazaStatistici = false;
      },
    });
  }
}
