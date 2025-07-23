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
      },
      scales: {
        x: { display: true, title: { display: true, text: 'Ani' } },
        y: {
          display: true,
          title: { display: true, text: 'Număr contestații' },
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
const subjectLabel = this.selectedSubject!.label;

    this.contestatiiService.getContestatii(year, judet).subscribe({
      next: (data) => {
        const contestatiiMaterie = data.filter(
          (d) => d.materie === subjectLabel
        );

        this.total = contestatiiMaterie.length;
        this.noteCrescute = contestatiiMaterie.filter(
          (d) => d.diferenta > 0
        ).length;
        this.noteScazute = contestatiiMaterie.filter(
          (d) => d.diferenta < 0
        ).length;
        this.noteNeschimbate = contestatiiMaterie.filter(
          (d) => d.diferenta === 0
        ).length;

        const sumaDiferente = contestatiiMaterie.reduce(
          (sum, d) => sum + (d.diferenta || 0),
          0
        );
        this.diferentaMedie = this.total > 0 ? sumaDiferente / this.total : 0;

        this.chartLabels = [year.toString()];
        this.chartData = [
          {
            label: 'Contestații',
            data: [this.total],
            fill: false,
            tension: 0.4,
          },
        ];

        this.afiseazaStatistici = true;
      },
      error: (err) => {
        console.error('Eroare la contestații:', err);
        this.chartData = [];
        this.chartLabels = [];
        this.afiseazaStatistici = false;
      },
    });
  }
}
