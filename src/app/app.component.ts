import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BreadcrumbsComponent } from '../breadcrumbs.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BreadcrumbsComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'liceu-bac-app';
}
