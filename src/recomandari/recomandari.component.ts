import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recomandari',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recomandari.component.html',
  styleUrls: ['./recomandari.component.scss']
})
export class RecomandariComponent {
  constructor(private router: Router) {}

  goToLicee() {
    this.router.navigate(['/recomandari-liceu']);
  }

  goToBac() {
    this.router.navigate(['/statistici-bac']);
  }
}
