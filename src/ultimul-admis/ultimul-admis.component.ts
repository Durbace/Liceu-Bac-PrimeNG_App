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

  culoriAlocate: Record<string, string> = {};

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

  onLiceuChange(liceu: { label: string; value: string } | null) {
    if (!liceu) {
      this.specializari = [];
      this.selectedSpec = null;
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

    const aniUnici = new Set([...this.chartLabels, ...ani]);
    this.chartLabels = Array.from(aniUnici).sort();

    const datePeAni = this.chartLabels.map(
      (an) => this.rawData[key][an]?.pozitiaUltim ?? null
    );

    const culoare = this.getColorForKey(key);

    this.chartData.push({
      label: key,
      data: datePeAni,
      tension: 0.3,
      fill: false,
      borderColor: culoare,
      backgroundColor: culoare,
      borderWidth: 2,
      pointBorderColor: culoare,
      pointBackgroundColor: culoare,
    });
  }

  curataFiltre() {
    this.filtreActive = [];
    this.chartData = [];
    this.chartLabels = [];
  }

  getColorForKey(key: string): string {
    if (this.culoriAlocate[key]) {
      return this.culoriAlocate[key];
    }

    const colors = [
      '#2563eb',
      '#9333ea',
      '#16a34a',
      '#dc2626',
      '#f59e0b',
      '#0ea5e9',
      '#e11d48',
      '#10b981',
      '#7c3aed',
      '#0284c7',
      '#ca8a04',
      '#3b82f6',
    ];

    const usedColors = Object.values(this.culoriAlocate);
    const unusedColors = colors.filter((c) => !usedColors.includes(c));

    const newColor =
      unusedColors.length > 0
        ? unusedColors[Math.floor(Math.random() * unusedColors.length)]
        : '#' + Math.floor(Math.random() * 16777215).toString(16);

    this.culoriAlocate[key] = newColor;
    return newColor;
  }

  onJudetChange(judet: { label: string; value: string } | null) {
    if (!judet) {
      this.selectedJudet = null;
      this.licee = [];
      this.selectedLiceu = null;
      this.specializari = [];
      return;
    }

    this.selectedJudet = judet;
    this.selectedLiceu = null;
    this.selectedSpec = null;
    this.licee = [];
    this.specializari = [];

    this.ultimulAdmisService.getUltimulAdmis(judet.value).subscribe((data) => {
      const keys = Object.keys(data).filter((k) => k.includes(' | '));
      const liceeSet = new Set(keys.map((k) => k.split(' | ')[0].trim()));
      this.licee = Array.from(liceeSet)
        .sort()
        .map((v) => ({ label: v, value: v }));

      if (this.selectedLiceu) {
        const liceuNorm = this.selectedLiceu.value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

        const specs = keys
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

        this.specializari = Array.from(new Set(specs))
          .sort()
          .map((v) => ({ label: v, value: v }));
      }
    });
  }
}
