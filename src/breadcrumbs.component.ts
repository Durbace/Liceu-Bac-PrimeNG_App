import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumbs" *ngIf="breadcrumbs.length > 1">
      <span *ngFor="let crumb of breadcrumbs; let last = last">
        <a [routerLink]="crumb.url">{{ crumb.label }}</a>
        <span *ngIf="!last"> > </span>
      </span>
    </nav>
  `,
  styles: [`
    .breadcrumbs {
      margin: 12px 30px;
      font-size: 0.9rem;
      color: #444;
    }

    .breadcrumbs a {
      text-decoration: none;
      color: #6a0dad;
    }

    .breadcrumbs a:hover {
      text-decoration: underline;
    }
  `]
})
export class BreadcrumbsComponent {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const parts = event.urlAfterRedirects.split('/').filter(Boolean);
        this.breadcrumbs = parts.map((part, i) => ({
          label: this.capitalize(part.replace('-', ' ')),
          url: '/' + parts.slice(0, i + 1).join('/'),
        }));
      }
    });
  }

  capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
