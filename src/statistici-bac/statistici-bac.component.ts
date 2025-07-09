import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

import { JudeteService } from '../services/judete.service';
import { BacStatisticiService, Elev } from '../services/bac-statistici.service';

@Component({
  selector: 'app-statistici-bac',
  standalone: true,
  imports: [FormsModule, CommonModule, NgChartsModule],
  templateUrl: './statistici-bac.component.html',
  styleUrl: './statistici-bac.component.css',
})
export class StatisticiBacComponent implements OnInit {
  judete: string[];
  selectedJudet = 'BV';

  unitati: string[] = ['Toate'];
  selectedUnitate = 'Toate';

  elevi: Elev[] = [];
  mediaGenerala = 0;
  totalElevi = 0;

  numarReusiti = 0;
  numarRespinsi = 0;
  numarNeprezentati = 0;

  specializari: string[] = ['Toate'];
  selectedSpecializare = 'Toate';

  pieChartData: ChartConfiguration['data'] = {
    labels: ['Neprezentat', 'Respins', '6–7', '7–8', '8–9', '9–10'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw as number;

            const data = context.chart.data.datasets[0].data as number[];
            const total = data.reduce((acc, val) => acc + (val as number), 0);

            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} elevi (${percentage}%)`;
          },
        },
      },
    },
  };

  pieChartType: ChartType = 'pie';

  constructor(
    private http: HttpClient,
    private judeteService: JudeteService,
    private bacService: BacStatisticiService
  ) {
    this.judete = this.judeteService.getAllCodes();
  }

  ngOnInit(): void {
    this.loadJudetData();
  }

  loadJudetData() {
    this.bacService
      .getEleviDinJudet(this.selectedJudet)
      .subscribe((data: Elev[]) => {
        this.elevi = data;

        const unitSet = new Set(data.map((e) => e.liceu));

        this.unitati = ['Toate', ...Array.from(unitSet)];

        const specializariSet = new Set(data.map((e) => e.specializarea));
        this.specializari = ['Toate', ...Array.from(specializariSet)];

        this.filterAndCompute();
      });
  }

  filterAndCompute() {
    let filtered = this.elevi;

    if (this.selectedUnitate !== 'Toate') {
      filtered = filtered.filter((e) => e.liceu === this.selectedUnitate);
    }

    if (this.selectedSpecializare !== 'Toate') {
      filtered = filtered.filter(
        (e) => e.specializarea === this.selectedSpecializare
      );
    }

    this.totalElevi = filtered.length;

    this.mediaGenerala = +(
      filtered.reduce((acc, e) => acc + (e.medieAdmitere || 0), 0) /
      this.totalElevi
    ).toFixed(2);

    const intervale = [0, 0, 0, 0, 0, 0];

    for (const elev of filtered) {
      const status = elev.status;
      const m = elev.medieAdmitere;

      if (status === 'NEPREZENTAT') {
        intervale[0]++;
      } else if (status === 'RESPINS') {
        intervale[1]++;
      } else if (status === 'REUȘIT' && m !== null) {
        if (m < 7) {
          intervale[2]++;
        } else if (m < 8) {
          intervale[3]++;
        } else if (m < 9) {
          intervale[4]++;
        } else {
          intervale[5]++;
        }
      }
    }

    this.numarReusiti = filtered.filter((e) => e.status === 'REUȘIT').length;
    this.numarRespinsi = filtered.filter((e) => e.status === 'RESPINS').length;
    this.numarNeprezentati = filtered.filter(
      (e) => e.status === 'NEPREZENTAT'
    ).length;

    const neprezentati = filtered.filter(
      (e) => e.medieAdmitere === null || e.medieAdmitere === 0
    );
    console.log('Neprezentati:', neprezentati);

    this.pieChartData = {
      labels: ['Neprezentat', 'Respins', '6–7', '7–8', '8–9', '9–10'],
      datasets: [{ data: intervale }],
    };
  }
}
