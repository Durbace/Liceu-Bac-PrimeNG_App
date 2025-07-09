import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  imports: []
})
export class HomepageComponent {
  constructor(private router: Router) {}

  onStart() {
    this.router.navigate(['/recomandari']);
  }
}
