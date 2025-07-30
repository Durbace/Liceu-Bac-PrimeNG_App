import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  templateUrl: './homepage.component.html'
})
export class HomepageComponent implements OnInit {
  showIntro = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.showIntro = false;
    }, 3000);
  }

  onStart() {
    this.router.navigate(['/recomandari']);
  }

  @HostListener('window:click')
  @HostListener('window:scroll')
  closeIntro() {
    this.showIntro = false;
  }
}
