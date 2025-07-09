import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LiceuService, Liceu } from '../services/liceu.service';
import { JudeteService } from '../services/judete.service';
import { AnService } from '../services/an.service';

@Component({
  selector: 'app-recomandari-liceu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recomandari-liceu.component.html',
  styleUrls: ['./recomandari-liceu.component.css'],
})
export class RecomandariLiceuComponent {
  judete: string[] = [];
  selectedJudet = '';
  media: number | null = null;
  licee: Liceu[] = [];
  loading = false;
  error = '';
  profiluriDisponibile: string[] = [];
  profilSelectat: string = '';
  sortareDescrescator: boolean = true;
  aniDisponibili: number[] = [];
  anSelectat: number | null = null;

  constructor(
    private liceuService: LiceuService,
    private judeteService: JudeteService,
    private anService: AnService
  ) {
    this.judete = this.judeteService.getAllNames();
    this.loadAniDisponibili();
  }

  onSubmit() {
    if (!this.selectedJudet || this.media === null || this.anSelectat === null)
      return;

    this.loading = true;
    this.error = '';
    this.licee = [];

    this.liceuService
      .getLicee(this.anSelectat, this.selectedJudet, this.media)
      .subscribe({
        next: (data) => {
          this.licee = data;
          this.actualizeazaProfiluri();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Eroare la încarcarea liceelor.';
          this.loading = false;
        },
      });
  }

  private actualizeazaProfiluri() {
    const profiluriSet = new Set(
      this.licee.map((l) => l.profil).filter((p) => p.trim() !== '')
    );
    this.profiluriDisponibile = Array.from(profiluriSet).sort();
  }

  get liceeFiltrateSortate(): Liceu[] {
    let filtrate = this.licee;

    if (this.profilSelectat) {
      filtrate = filtrate.filter((l) => l.profil === this.profilSelectat);
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
        this.aniDisponibili = ani;
        this.anSelectat = ani[0];
      },
      error: () => {
        this.aniDisponibili = [];
        this.anSelectat = null;
      },
    });
  }
}
