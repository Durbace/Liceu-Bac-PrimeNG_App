import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { GradOcupareComponent } from './grad-ocupare.component';

import {
  GradOcupareService,
  GradOcupareItem,
} from '../services/grad-ocupare.service';
import { AnService } from '../services/an.service';

class AnServiceMock {
  getAniDisponibili() {
    return of([2025, 2024, 2023]);
  }
}

class GradOcupareServiceMock {
  getJudete() {
    return of([
      { nume: 'Brașov', cod: 'BV' },
      { nume: 'București', cod: 'B' },
    ]);
  }

  getGradOcupare(an: number, pozitie: number, judet?: string | null) {
    const complet: GradOcupareItem[] = [
      {
        liceu: 'CN Andrei Șaguna',
        specializare: 'Mate-Info',
        ocupate: 28,
        libere: 0,
        total: 28,
        procent: '100%',
        medieUltim: 9.12,
        judet: 'BV',
      },
      {
        liceu: 'CN Mehedinți',
        specializare: 'Științe ale naturii',
        ocupate: 30,
        libere: 0,
        total: 30,
        procent: '100%',
        medieUltim: 8.77,
        judet: 'MH',
      },
    ];

    const partial: GradOcupareItem[] = [
      {
        liceu: 'Liceul X',
        specializare: 'Mate-Info',
        ocupate: 20,
        libere: 5,
        total: 25,
        procent: '80%',
        medieUltim: 7.9,
        judet: 'BV',
      },
    ];

    const neocupat: GradOcupareItem[] = [
      {
        liceu: 'Liceul Y',
        specializare: 'Filologie',
        ocupate: 0,
        libere: 25,
        total: 25,
        procent: '0%',
        medieUltim: 0,
        judet: 'B',
      },
    ];

    return of({ complet, partial, neocupat });
  }

  getGradOcupareWithError() {
    return throwError(() => new Error('fail'));
  }
}

import { Component } from '@angular/core';
@Component({ standalone: true, template: '<p>Recomandari</p>' })
class DummyRecomandariComponent {}

describe('GradOcupareComponent (standalone)', () => {
  let fixture: ComponentFixture<GradOcupareComponent>;
  let component: GradOcupareComponent;
  let router: Router;
  let location: Location;
  let gradServiceMock: GradOcupareServiceMock;

  beforeEach(async () => {
    gradServiceMock = new GradOcupareServiceMock();

    await TestBed.configureTestingModule({
      imports: [GradOcupareComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'recomandari', component: DummyRecomandariComponent },
        ]),
        { provide: GradOcupareService, useValue: gradServiceMock },
        { provide: AnService, useClass: AnServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GradOcupareComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load years and counties on init and preselect the first year', () => {
    expect(component.aniDisponibili.length).toBeGreaterThan(0);
    expect(component.anSelectat?.value).toBe(2025);
    expect(component.judete.length).toBe(2);
    expect(component.judetSelectat).toBeNull();
  });

  it('should render basic UI parts', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('p-dropdown').length).toBeGreaterThan(1);
    expect(el.querySelector('input[type="number"]')).toBeTruthy();
    expect(el.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('onSubmit() happy path should load data and set default tab', fakeAsync(() => {
    component.pozitie = 1;
    component.judetSelectat = { label: 'Brașov', value: 'BV' };

    component.onSubmit();
    tick();
    fixture.detectChanges();

    expect(component.areRezultate).toBeTrue();
    expect(component.complet.length).toBeGreaterThan(0);
    expect(component.partial.length).toBeGreaterThan(0);
    expect(component.neocupat.length).toBeGreaterThan(0);
    expect(component.activeTabIndex).toBe(0);
    expect(component.tipSelectatValue).toBe('complet');
  }));

  it('onSubmit() error path should show error message', fakeAsync(() => {
    spyOn(gradServiceMock, 'getGradOcupare').and.returnValue(
      gradServiceMock.getGradOcupareWithError()
    );

    component.pozitie = 1;
    component.judetSelectat = { label: 'Brașov', value: 'BV' };

    component.onSubmit();
    tick();
    fixture.detectChanges();

    expect(component.error).toBe('Eroare la încărcarea datelor.');
    expect(fixture.nativeElement.textContent).toContain(
      'Eroare la încărcarea datelor.'
    );
  }));

  it('should render tabview after successful submit', fakeAsync(() => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('p-tabview')).toBeFalsy();

    component.pozitie = 1;
    component.judetSelectat = { label: 'Brașov', value: 'BV' };
    component.onSubmit();
    tick();
    fixture.detectChanges();

    expect(el.querySelector('p-tabview')).toBeTruthy();
  }));

  it('should enable submit when form becomes valid', fakeAsync(() => {
    const btn = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    component.pozitie = 1;
    component.judetSelectat = { label: 'Brașov', value: 'BV' };
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(btn.disabled).toBeFalse();
  }));

  it('should build profile filters and filter by profile + search term', fakeAsync(() => {
    component.pozitie = 1;
    component.judetSelectat = { label: 'Brașov', value: 'BV' };
    component.onSubmit();
    tick();
    fixture.detectChanges();

    expect(component.profiluriDisponibile.length).toBeGreaterThan(1);

    const someProfile = component.profiluriDisponibile.find((p) => p.value);
    component.profilSelectat = someProfile || null;
    fixture.detectChanges();

    expect(
      component.liceeAfisate.every(
        (i) => i.specializare === (someProfile?.value ?? null)
      )
    ).toBeTrue();

    component.searchTermLiceu = 'NU-EXISTA';
    fixture.detectChanges();
    expect(component.liceeAfisate.length).toBe(0);
  }));

  it('onTabChange() should update tipSelectatValue', () => {
    component.onTabChange({ index: 2 });
    expect(component.tipSelectatValue).toBe('neocupat');
    component.onTabChange({ index: 1 });
    expect(component.tipSelectatValue).toBe('partial');
  });

  it('blockMinusKey() should prevent typing "-"', () => {
    const prevent = jasmine.createSpy('preventDefault');
    component.blockMinusKey({ key: '-', preventDefault: prevent } as any);
    expect(prevent).toHaveBeenCalled();
  });

  it('preventNegativePaste() should prevent negative paste', () => {
    const prevent = jasmine.createSpy('preventDefault');
    const ev = {
      clipboardData: { getData: () => '-12' },
      preventDefault: prevent,
    } as any;
    component.preventNegativePaste(ev);
    expect(prevent).toHaveBeenCalled();
  });

  it('goBack() should navigate to /recomandari', fakeAsync(() => {
    const navSpy = spyOn(router, 'navigate').and.callThrough();
    component.goBack();
    tick();
    expect(navSpy).toHaveBeenCalledWith(['/recomandari']);
  }));
});
