import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';

import { LiceuService, Liceu } from '../services/liceu.service';
import { JudeteService } from '../services/judete.service';
import { AnService } from '../services/an.service';

@Component({
  selector: 'app-recomandari-liceu',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, TableModule],
  templateUrl: './recomandari-liceu.component.html',
  styleUrls: ['./recomandari-liceu.component.css'],
})
export class RecomandariLiceuComponent implements OnInit {
  judete: { label: string; value: string }[] = [];
  selectedJudet: { label: string; value: string } | null = null;
  media: number | string | null = null;
  licee: Liceu[] = [];
  loading = false;
  error = '';

  profiluriDisponibile: { label: string; value: string }[] = [];
  profilSelectat: { label: string; value: string } | null = null;
  sortareDescrescator: boolean = true;

  aniDisponibili: { label: string; value: number }[] = [];
  anSelectat: { label: string; value: number } | null = null;

  constructor(
    private liceuService: LiceuService,
    private judeteService: JudeteService,
    private anService: AnService
  ) {}
  ngOnInit() {
    this.judeteService.getJudete().subscribe({
      next: (judete) => {
        this.judete = judete.map((j) => ({
          label: j.nume,
          value: j.cod,
        }));
      },
      error: (err) => {
        console.error('Eroare la încărcarea județelor:', err);
        this.error = 'Nu s-au putut încărca județele.';
      },
    });

    this.loadAniDisponibili();
  }
  onSubmit() {
    if (!this.selectedJudet || this.media === null || this.anSelectat === null)
      return;

    const mediaTrimisa =
      typeof this.media === 'string'
        ? parseFloat(this.media.replace(',', '.'))
        : this.media;

    if (isNaN(mediaTrimisa)) {
      this.error = 'Media introdusă este invalidă.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.licee = [];

    this.liceuService.getLicee(this.anSelectat!.value, this.selectedJudet!.value, mediaTrimisa)

      .subscribe({
        next: (data) => {
          this.licee = data;
          this.actualizeazaProfiluri();
          this.loading = false;
        },
        error: () => {
          this.error = 'Eroare la încarcarea liceelor.';
          this.loading = false;
        },
      });
  }

  private actualizeazaProfiluri() {
    const profiluriSet = new Set(
      this.licee.map((l) => l.profil).filter((p) => p.trim() !== '')
    );

    this.profiluriDisponibile = Array.from(profiluriSet)
      .sort()
      .map((p) => ({ label: p, value: p }));
  }

  get liceeFiltrateSortate(): Liceu[] {
    let filtrate = this.licee;

    if (this.profilSelectat) {
      filtrate = filtrate.filter((l) => l.profil === this.profilSelectat!.value);
    }

    return filtrate.sort((a, b) =>
      this.sortareDescrescator
        ? b.medieMinima - a.medieMinima
        : a.medieMinima - b.medieMinima
    );
  }

  loadAniDisponibili() {
    this.anService.getAniDisponibili().subscribe({
      next: (ani) => {
        this.aniDisponibili = ani.map((an) => ({
          label: an.toString(),
          value: an,
        }));

       this.anSelectat = this.aniDisponibili[0] ?? null;

      },
      error: () => {
        this.aniDisponibili = [];
        this.anSelectat = null;
      },
    });
  }
}
