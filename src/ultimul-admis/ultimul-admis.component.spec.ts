import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { UltimulAdmisChartComponent } from './ultimul-admis.component';
import { UltimulAdmisService } from '../services/ultimul-admis.service';
import { JudeteService } from '../services/judete.service';

/* Dummy pentru ruta de back */
@Component({ standalone: true, template: '<p>Dummy</p>' })
class DummyComponent {}

/* ---- Mock data ALINIATĂ cu UI (fără diacritice în specializare) ---- */
type Row = { medieUltim: number; pozitiaUltim: number };

const RAW_ALL: Record<string, Record<string, Row>> = {
  'Liceu A | Mate-Info': {
    '2022': { medieUltim: 8.50, pozitiaUltim: 120 },
    '2023': { medieUltim: 8.60, pozitiaUltim: 110 },
  },
  'Liceu A | Stiinte ale naturii': {
    '2023': { medieUltim: 8.10, pozitiaUltim: 150 },
    '2024': { medieUltim: 8.20, pozitiaUltim: 140 },
  },
  'Liceu B | Filologie': {
    '2022': { medieUltim: 7.40, pozitiaUltim: 200 },
  },
};

const RAW_BV: Record<string, Record<string, Row>> = {
  'Liceu A | Mate-Info': {
    '2023': { medieUltim: 8.60, pozitiaUltim: 110 },
  },
};

const RAW_B: Record<string, Record<string, Row>> = {
  'Liceu C | Mate-Info': {
    '2022': { medieUltim: 8.00, pozitiaUltim: 180 },
    '2023': { medieUltim: 8.30, pozitiaUltim: 160 },
  },
};

/* ---- Mock services ---- */
class UltimulAdmisServiceMock {
  getUltimulAdmis(code?: string) {
    if (code === 'BV') return of(RAW_BV);
    if (code === 'B') return of(RAW_B);
    return of(RAW_ALL);
  }
}
class JudeteServiceMock {
  getJudete() {
    return of([
      { nume: 'Brașov', cod: 'BV' },
      { nume: 'București', cod: 'B' },
    ]);
  }
}

describe('UltimulAdmisChartComponent (standalone)', () => {
  let fixture: ComponentFixture<UltimulAdmisChartComponent>;
  let component: UltimulAdmisChartComponent;
  let router: Router;
  let ultimulAdmisSvc: UltimulAdmisServiceMock;

  beforeEach(async () => {
    ultimulAdmisSvc = new UltimulAdmisServiceMock();

    await TestBed.configureTestingModule({
      imports: [UltimulAdmisChartComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'recomandari', component: DummyComponent }]),
        { provide: UltimulAdmisService, useValue: ultimulAdmisSvc },
        { provide: JudeteService, useClass: JudeteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UltimulAdmisChartComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('onLiceuChange should populate specializari for selected liceu (normalizate)', fakeAsync(() => {
    fixture.detectChanges(); tick(); fixture.detectChanges();

    component.onLiceuChange({ label: 'Liceu A', value: 'Liceu A' });
    fixture.detectChanges();

    const specs = component.specializari.map(s => s.label);
    expect(specs).toContain('Mate-Info');
    // 🔧 așteptăm forma fără diacritice (așa le construiește componenta)
    expect(specs).toContain('Stiinte ale naturii');

    component.onLiceuChange(null);
    expect(component.specializari.length).toBe(0);
    expect(component.selectedSpec).toBeNull();
  }));

  it('adaugaFiltru should add dataset, make years union and avoid duplicates', fakeAsync(() => {
    fixture.detectChanges(); tick(); fixture.detectChanges();

    // 1) Primul filtru: Mate-Info (ani 2022, 2023)
    component.selectedLiceu = { label: 'Liceu A', value: 'Liceu A' };
    component.onLiceuChange(component.selectedLiceu);
    component.selectedSpec  = { label: 'Mate-Info', value: 'Mate-Info' };

    component.adaugaFiltru();
    fixture.detectChanges();

    expect(component.filtreActive).toContain('Liceu A | Mate-Info');
    expect(component.chartLabels).toEqual(['2022', '2023']);
    expect(component.chartData.length).toBe(1);
    expect(component.chartData[0].data as number[]).toEqual([120, 110]);

    // 2) Al doilea filtru: Stiinte ale naturii (ani 2023, 2024)
    component.selectedSpec = { label: 'Stiinte ale naturii', value: 'Stiinte ale naturii' };
    component.adaugaFiltru();
    fixture.detectChanges();

    expect(component.chartLabels).toEqual(['2022', '2023', '2024']);
    expect(component.chartData.length).toBe(2);

    const d0 = component.chartData[0].data as (number|null)[];
    const d1 = component.chartData[1].data as (number|null)[];
    expect(d0).toEqual([120, 110, null]);     // pentru Mate-Info nu există 2024
    expect(d1).toEqual([null, 150, 140]);     // pentru Stiinte ale naturii nu există 2022

    // 3) Re-adăugare același filtru → fără duplicate
    component.adaugaFiltru();
    expect(component.chartData.length).toBe(2);
  }));

  it('curataFiltre should clear filters and chart data', fakeAsync(() => {
    fixture.detectChanges(); tick(); fixture.detectChanges();

    component.selectedLiceu = { label: 'Liceu A', value: 'Liceu A' };
    component.onLiceuChange(component.selectedLiceu);
    component.selectedSpec  = { label: 'Mate-Info', value: 'Mate-Info' };
    component.adaugaFiltru();

    expect(component.chartData.length).toBe(1);
    expect(component.filtreActive.length).toBe(1);

    component.curataFiltre();
    expect(component.chartData.length).toBe(0);
    expect(component.chartLabels.length).toBe(0);
    expect(component.filtreActive.length).toBe(0);
  }));

  it('onJudetChange should reset on null and fetch licee for valid county', fakeAsync(() => {
    fixture.detectChanges(); tick(); fixture.detectChanges();

    component.onJudetChange(null);
    expect(component.selectedJudet).toBeNull();
    expect(component.licee.length).toBe(0);
    expect(component.specializari.length).toBe(0);

    const spy = spyOn(ultimulAdmisSvc, 'getUltimulAdmis').and.callThrough();
    component.onJudetChange({ label: 'Bucuresti', value: 'B' });
    tick(); fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('B');
    expect(component.licee.map(l => l.label)).toEqual(['Liceu C']);
  }));

  it('should render dropdowns, buttons and chart canvas', fakeAsync(() => {
    fixture.detectChanges(); tick(); fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('p-dropdown').length).toBe(3);

    const addBtn = el.querySelector('button[icon="pi pi-plus"]');
    const clrBtn = el.querySelector('button[icon="pi pi-trash"]');
    expect(addBtn).toBeTruthy();
    expect(clrBtn).toBeTruthy();

    expect(el.querySelector('canvas')).toBeTruthy();
  }));

  it('goBack() should navigate to /recomandari', fakeAsync(() => {
    fixture.detectChanges(); tick(); fixture.detectChanges();
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.goBack();
    tick();
    expect(navSpy).toHaveBeenCalledWith(['/recomandari']);
  }));
});
