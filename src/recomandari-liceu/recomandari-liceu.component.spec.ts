import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';

import { RecomandariLiceuComponent } from './recomandari-liceu.component';
import { LiceuService, Liceu } from '../services/liceu.service';
import { JudeteService } from '../services/judete.service';
import { AnService } from '../services/an.service';

@Component({ standalone: true, template: '<p>Dummy</p>' })
class DummyComponent {}

class JudeteServiceMock {
  getJudete() {
    return of([
      { nume: 'Brașov', cod: 'BV' },
      { nume: 'București', cod: 'B' },
    ]);
  }
}

class AnServiceMock {
  getAniDisponibili() {
    return of([2025, 2024, 2023]);
  }
}

class LiceuServiceMock {
  getLicee(an: number, judet: string, media: number) {
    const data: Liceu[] = [
      { liceu: 'CN Andrei Șaguna', profil: 'Mate-Info', medieMinima: 9.1 },
      { liceu: 'CN Unirea', profil: 'Științe ale naturii', medieMinima: 8.75 },
      { liceu: 'Liceul X', profil: 'Mate-Info', medieMinima: 8.2 },
    ];
    return of(data);
  }
  getLiceeWithError() {
    return throwError(() => new Error('fail'));
  }
}

describe('RecomandariLiceuComponent (standalone)', () => {
  let fixture: ComponentFixture<RecomandariLiceuComponent>;
  let component: RecomandariLiceuComponent;
  let router: Router;
  let liceuServiceMock: LiceuServiceMock;

  beforeEach(async () => {
    liceuServiceMock = new LiceuServiceMock();

    await TestBed.configureTestingModule({
      imports: [RecomandariLiceuComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'recomandari', component: DummyComponent }]),
        { provide: LiceuService, useValue: liceuServiceMock },
        { provide: JudeteService, useClass: JudeteServiceMock },
        { provide: AnService, useClass: AnServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecomandariLiceuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load years and counties on init and preselect the first year', () => {
    expect(component.aniDisponibili.length).toBe(3);
    expect(component.anSelectat?.value).toBe(2025);
    expect(component.judete.length).toBe(2);
    expect(component.error).toBe('');
  });

  it('submit button should be disabled until form is valid (media required)', fakeAsync(() => {
    const btn = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();

    component.media = 8.5;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(btn.disabled).toBeFalse();
  }));

  it('onSubmit() happy path should load licee and build profile filters', fakeAsync(() => {
    component.anSelectat = { label: '2025', value: 2025 };
    component.selectedJudet = { label: 'Brașov', value: 'BV' };
    component.media = 8.5;

    fixture.detectChanges();
    component.onSubmit();

    tick();
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
    expect(component.licee.length).toBeGreaterThan(0);
    expect(component.profiluriDisponibile.length).toBeGreaterThan(1);
  }));

  it('onSubmit() error path should set error message and stop loading', fakeAsync(() => {
    const svc = TestBed.inject(LiceuService) as any as LiceuServiceMock;
    spyOn(svc, 'getLicee').and.returnValue(svc.getLiceeWithError());

    component.anSelectat = { label: '2025', value: 2025 };
    component.selectedJudet = { label: 'Brașov', value: 'BV' };
    component.media = 8.5;

    fixture.detectChanges();
    component.onSubmit();

    tick();
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Eroare la încarcarea liceelor.');
    expect(component.licee.length).toBe(0);
  }));

  it('should filter licee by profil and search term', fakeAsync(() => {
    component.anSelectat = component.anSelectat ?? {
      label: '2025',
      value: 2025,
    };
    component.selectedJudet = { label: 'Brașov', value: 'BV' };
    component.media = 8.5;

    component.onSubmit();
    tick();
    fixture.detectChanges();

    component.profilSelectat = { label: 'Mate-Info', value: 'Mate-Info' };
    fixture.detectChanges();
    expect(component.liceeFiltrateSortate.length).toBeGreaterThan(0);
    expect(
      component.liceeFiltrateSortate.every((l) => l.profil === 'Mate-Info')
    ).toBeTrue();

    component.searchTermLiceu = 'Șaguna';
    fixture.detectChanges();

    const filtered = component.liceeFiltrateSortate;
    expect(filtered.length).toBe(1);
    expect(filtered[0].liceu).toContain('Șaguna');

    component.searchTermLiceu = 'NU-EXISTA';
    fixture.detectChanges();
    expect(component.liceeFiltrateSortate.length).toBe(0);
  }));

  it('blockMinusKey() should prevent typing "-"', () => {
    const prevent = jasmine.createSpy('preventDefault');
    component.blockMinusKey({ key: '-', preventDefault: prevent } as any);
    expect(prevent).toHaveBeenCalled();
  });

  it('preventNegativePaste() should prevent negative paste', () => {
    const prevent = jasmine.createSpy('preventDefault');
    const ev = {
      clipboardData: { getData: () => '-9.50' },
      preventDefault: prevent,
    } as any;
    component.preventNegativePaste(ev);
    expect(prevent).toHaveBeenCalled();
  });

  it('goBack() should navigate to /recomandari', fakeAsync(() => {
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.goBack();
    tick();
    expect(navSpy).toHaveBeenCalledWith(['/recomandari']);
  }));
});
