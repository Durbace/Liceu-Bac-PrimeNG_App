import { Routes } from '@angular/router';
import { HomepageComponent } from '../homepage/homepage.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  {
    path: 'recomandari',
    loadComponent: () =>
      import('../recomandari/recomandari.component').then(m => m.RecomandariComponent)
  },
  {
    path: 'recomandari-liceu',
    loadComponent: () =>
      import('../recomandari-liceu/recomandari-liceu.component').then(m => m.RecomandariLiceuComponent)
  },
  {
    path: 'statistici-bac',
    loadComponent: () =>
      import('../statistici-bac/statistici-bac.component').then(m => m.StatisticiBacComponent)
  },

  {
    path: 'ultimul-admis',
    loadComponent: () =>
      import('../ultimul-admis/ultimul-admis.component').then(m => m.UltimulAdmisChartComponent)
  },

   {
    path: 'istoric-contestatii',
    loadComponent: () =>
      import('../istoric-contestatii/istoric-contestatii.component').then(m => m.IstoricContestatiiComponent)
  },
  {
    path: 'grad-ocupare',
    loadComponent: () =>
      import('../grad-ocupare/grad-ocupare.component').then(m => m.GradOcupareComponent)
  }



];
