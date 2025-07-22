import { Component, OnInit } from '@angular/core';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { NgIf, NgFor } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { UltimulAdmisService } from '../services/ultimul-admis.service';
import { JudeteService } from '../services/judete.service';

@Component({
  selector: 'app-ultimul-admis-chart',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DropdownModule,
    ButtonModule,
    FormsModule,
    NgChartsModule,
  ],
  templateUrl: './ultimul-admis.component.html',
})
export class UltimulAdmisChartComponent implements OnInit {
  rawData!: Record<
    string,
    Record<string, { medieUltim: number; pozitiaUltim: number }>
  >;
  licee: { label: string; value: string }[] = [];
  specializari: { label: string; value: string }[] = [];

  selectedLiceu: { label: string; value: string } | null = null;
  selectedSpec: { label: string; value: string } | null = null;
  filtreActive: string[] = [];

  chartLabels: string[] = [];
  chartData: ChartDataset[] = [];
  chartType: ChartType = 'line';

  judete: { label: string; value: string }[] = [];
  selectedJudet: { label: string; value: string } | null = null;

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Pozitia ultimului admis pe ani - liceu si specializare',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Pozitia ultimului admis',
        },
        suggestedMin: 0,
      },
    },
  };

  constructor(
    private ultimulAdmisService: UltimulAdmisService,
    private judeteService: JudeteService
  ) {}

  ngOnInit(): void {
    this.judeteService.getJudete().subscribe((j) => {
      this.judete = j.map((x) => ({ label: x.nume, value: x.cod }));
    });

    this.ultimulAdmisService.getUltimulAdmis().subscribe((data) => {
      this.rawData = data;

      const toateCheile = Object.keys(data).filter((k) => k.includes(' | '));
      const splitate = toateCheile.map((k) => {
        const [liceu, specializare] = k.split(' | ');
        return { liceu: liceu.trim(), specializare: specializare.trim() };
      });

      const liceeUnice = [...new Set(splitate.map((e) => e.liceu))];
      this.licee = liceeUnice.sort().map((val) => ({ label: val, value: val }));
    });
  }

  onLiceuChange(liceu: { label: string; value: string }) {
    if (!liceu) {
      this.specializari = [];
      return;
    }

    const liceuNorm = liceu.value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const specs = Object.keys(this.rawData)
      .map((key) => {
        const [l, s] = key.split('|').map((p) =>
          p
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
        );
        return { liceu: l, spec: s };
      })
      .filter((o) => o.liceu === liceuNorm)
      .map((o) => o.spec);

    this.specializari = [...new Set(specs)]
      .sort()
      .map((v) => ({ label: v, value: v }));

    this.selectedSpec = null;
  }

  adaugaFiltru() {
    if (!this.selectedLiceu || !this.selectedSpec) return;

    const key = `${this.selectedLiceu.value} | ${this.selectedSpec.value}`;
    if (this.filtreActive.includes(key)) return;

    this.filtreActive.push(key);
    const ani = Object.keys(this.rawData[key]).sort();

    if (!this.chartLabels.length) {
      this.chartLabels = ani;
    }

    this.chartData.push({
      label: key,
      data: ani.map((an) => this.rawData[key][an].pozitiaUltim),
      tension: 0.3,
      fill: false,
      borderColor: this.getRandomColor(),
      pointBackgroundColor: '#2563eb',
    });
  }

  curataFiltre() {
    this.filtreActive = [];
    this.chartData = [];
    this.chartLabels = [];
  }

  getRandomColor(): string {
    const colors = [
      '#2563eb',
      '#9333ea',
      '#16a34a',
      '#dc2626',
      '#f59e0b',
      '#0ea5e9',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  onJudetChange(judet: { label: string; value: string }) {
    this.selectedJudet = judet;

    this.selectedLiceu = null;
    this.selectedSpec = null;
    this.licee = [];
    this.specializari = [];
    this.filtreActive = [];
    this.chartLabels = [];
    this.chartData = [];

    this.ultimulAdmisService.getUltimulAdmis(judet.value).subscribe((data) => {
      this.rawData = data;
      const keys = Object.keys(data).filter((k) => k.includes(' | '));
      const liceeSet = new Set(keys.map((k) => k.split(' | ')[0].trim()));
      this.licee = Array.from(liceeSet)
        .sort()
        .map((v) => ({ label: v, value: v }));
    });
  }
}
