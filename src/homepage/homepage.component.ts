import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './homepage.component.html'
})
export class HomepageComponent {
  constructor(private router: Router) {}

  onStart() {
    this.router.navigate(['/recomandari']);
  }
}
