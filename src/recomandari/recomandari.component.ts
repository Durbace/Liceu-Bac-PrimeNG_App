import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-recomandari',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './recomandari.component.html',
})
export class RecomandariComponent {
  constructor(private router: Router) {}

  goToLicee() {
    this.router.navigate(['/recomandari-liceu']);
  }

  goToBac() {
    this.router.navigate(['/statistici-bac']);
  }
  
  goToContestatii() {
    this.router.navigate(['/contestatii']);
  }
  goToOcupare() {
    this.router.navigate(['/grad-ocupare']);
  }
  goToUltimulAdmis() {
    this.router.navigate(['/ultimul-admis']);
  }
}
