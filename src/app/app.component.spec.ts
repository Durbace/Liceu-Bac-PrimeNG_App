import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Routes, provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '<nav data-testid="navbar">Navbar</nav>',
})
class NavbarStubComponent {}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  template: '<div data-testid="breadcrumbs">Breadcrumbs</div>',
})
class BreadcrumbsStubComponent {}

@Component({
  standalone: true,
  template: '<h2 data-testid="home">Homepage works</h2>',
})
class HomepageStubComponent {}

@Component({
  standalone: true,
  template: '<h2 data-testid="recomandari">Recomandari works</h2>',
})
class RecomandariStubComponent {}

@Component({
  standalone: true,
  template: '<h2 data-testid="recomandari-liceu">Recomandari Liceu works</h2>',
})
class RecomandariLiceuStubComponent {}

@Component({
  standalone: true,
  template: '<h2 data-testid="statistici-bac">Statistici Bac works</h2>',
})
class StatisticiBacStubComponent {}

@Component({
  standalone: true,
  template: '<h2 data-testid="ultimul-admis">Ultimul Admis works</h2>',
})
class UltimulAdmisStubComponent {}

@Component({
  standalone: true,
  template: '<h2 data-testid="istoric-contestatii">Istoric Contestatii works</h2>',
})
class IstoricContestatiiStubComponent {}

@Component({
  standalone: true,
  template: '<h2 data-testid="grad-ocupare">Grad Ocupare works</h2>',
})
class GradOcupareStubComponent {}

const testRoutes: Routes = [
  { path: '', component: HomepageStubComponent },
  { path: 'recomandari', loadComponent: () => Promise.resolve(RecomandariStubComponent) },
  { path: 'recomandari-liceu', loadComponent: () => Promise.resolve(RecomandariLiceuStubComponent) },
  { path: 'statistici-bac', loadComponent: () => Promise.resolve(StatisticiBacStubComponent) },
  { path: 'ultimul-admis', loadComponent: () => Promise.resolve(UltimulAdmisStubComponent) },
  { path: 'istoric-contestatii', loadComponent: () => Promise.resolve(IstoricContestatiiStubComponent) },
  { path: 'grad-ocupare', loadComponent: () => Promise.resolve(GradOcupareStubComponent) },
];

describe('AppComponent (standalone + router)', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NavbarStubComponent,
        BreadcrumbsStubComponent,
      ],
      providers: [
        provideRouter(testRoutes),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  function create() {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create the app', () => {
    const fixture = create();
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render navbar and breadcrumbs', () => {
  const fixture = create();
  const el: HTMLElement = fixture.nativeElement;

  expect(el.querySelector('app-navbar')).withContext('Navbar not rendered').toBeTruthy();
  expect(el.querySelector('app-breadcrumbs')).withContext('Breadcrumbs not rendered').toBeTruthy();
});


  it('should have the correct title', () => {
    const fixture = create();
    const app = fixture.componentInstance as AppComponent;
    expect(app.title).toBe('liceu-bac-app');
  });

  it('should render Homepage on default route "/"', async () => {
    const fixture = create();
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(location.path()).toBe('');
    expect(el.querySelector('[data-testid="home"]')).toBeTruthy();
  });

  it('should navigate to /recomandari and render its component', async () => {
    const fixture = create();
    await router.navigateByUrl('/recomandari');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(location.path()).toBe('/recomandari');
    expect(el.querySelector('[data-testid="recomandari"]')).toBeTruthy();
  });

  it('should navigate to /statistici-bac (lazy) and render its component', async () => {
    const fixture = create();
    await router.navigateByUrl('/statistici-bac');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(location.path()).toBe('/statistici-bac');
    expect(el.querySelector('[data-testid="statistici-bac"]')).toBeTruthy();
  });

  it('should navigate to /ultimul-admis and render its component', async () => {
    const fixture = create();
    await router.navigateByUrl('/ultimul-admis');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(location.path()).toBe('/ultimul-admis');
    expect(el.querySelector('[data-testid="ultimul-admis"]')).toBeTruthy();
  });

  it('should navigate to /istoric-contestatii and render its component', async () => {
    const fixture = create();
    await router.navigateByUrl('/istoric-contestatii');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(location.path()).toBe('/istoric-contestatii');
    expect(el.querySelector('[data-testid="istoric-contestatii"]')).toBeTruthy();
  });

  it('should navigate to /grad-ocupare and render its component', async () => {
    const fixture = create();
    await router.navigateByUrl('/grad-ocupare');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(location.path()).toBe('/grad-ocupare');
    expect(el.querySelector('[data-testid="grad-ocupare"]')).toBeTruthy();
  });
});
