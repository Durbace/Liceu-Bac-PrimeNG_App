import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';

import {
  GradOcupareService,
  GradOcupareItem,
} from '../services/grad-ocupare.service';
import { AnService } from '../services/an.service';

@Component({
  selector: 'app-grad-ocupare',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, TableModule],
  templateUrl: './grad-ocupare.component.html',
  styleUrls: ['./grad-ocupare.component.css'],
})
export class GradOcupareComponent implements OnInit {
  aniDisponibili: { label: string; value: number }[] = [];
  anSelectat: { label: string; value: number } | null = null;

  pozitie: number | null = null;
  judete: { nume: string; cod: string }[] = [];
  judetSelectat: { label: string; value: string } | null = null;
  formularTrimis = false;

  complet: GradOcupareItem[] = [];
  partial: GradOcupareItem[] = [];
  neocupat: GradOcupareItem[] = [];

  loading = false;
  error = '';

  profiluriDisponibile: { label: string; value: string | null }[] = [];
  profilSelectat: { label: string; value: string | null } | null = null;
  searchTermLiceu = '';

  constructor(
    private gradService: GradOcupareService,
    private anService: AnService
  ) {}

  ngOnInit() {
    this.anService.getAniDisponibili().subscribe({
      next: (ani) => {
        this.aniDisponibili = ani.map((an) => ({
          label: an.toString(),
          value: an,
        }));
        this.anSelectat = this.aniDisponibili[0] ?? null;
      },
    });
    this.gradService.getJudete().subscribe({
      next: (judeteRaw) => {
        this.judete = judeteRaw;
        this.judetSelectat = null;
      },
    });
  }

  onSubmit() {
    this.formularTrimis = true;

    if (this.pozitie === null || !this.anSelectat) return;

    this.loading = true;
    this.error = '';
    this.complet = [];
    this.partial = [];

    this.gradService
      .getGradOcupare(
        this.anSelectat.value,
        this.pozitie,
        this.judetSelectat?.value
      )
      .subscribe({
        next: (data) => {
          this.complet = data.complet;
          this.partial = data.partial;
          this.neocupat = data.neocupat ?? [];
          this.actualizeazaProfiluri();
          this.loading = false;
        },
        error: () => {
          this.error = 'Eroare la încărcarea datelor.';
          this.loading = false;
        },
      });
  }

  private actualizeazaProfiluri() {
    const toate = [...this.complet, ...this.partial, ...this.neocupat];
    const set = new Set(toate.map((e) => e.specializare).filter(Boolean));
    this.profiluriDisponibile = [
      { label: 'Toate', value: null },
      ...Array.from(set)
        .sort()
        .map((p) => ({ label: p, value: p })),
    ];
    this.profilSelectat = null;
  }

  get completFiltrat(): GradOcupareItem[] {
    return this.filtreaza(this.complet);
  }

  get partialFiltrat(): GradOcupareItem[] {
    return this.filtreaza(this.partial);
  }

  private filtreaza(array: GradOcupareItem[]): GradOcupareItem[] {
    let rez = array;
    if (this.profilSelectat?.value) {
      rez = rez.filter((e) => e.specializare === this.profilSelectat!.value);
    }
    if (this.searchTermLiceu.trim()) {
      rez = rez.filter((e) =>
        e.liceu.toLowerCase().includes(this.searchTermLiceu.toLowerCase())
      );
    }
    return rez;
  }

  get neocupatFiltrat(): GradOcupareItem[] {
    return this.filtreaza(this.neocupat);
  }
}
