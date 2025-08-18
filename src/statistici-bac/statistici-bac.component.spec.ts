import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { StatisticiBacComponent } from './statistici-bac.component';
import { BacStatisticiService, Elev } from '../services/bac-statistici.service';
import { JudeteService } from '../services/judete.service';

@Component({ standalone: true, template: '<p>Dummy</p>' })
class DummyComponent {}

const MOCK_ELEVI: any[] = [
  {
    liceu: 'L1',
    specializarea: 'Mate-Info',
    status: 'NEPREZENTAT',
    medieAdmitere: null,
  },
  {
    liceu: 'L1',
    specializarea: 'Mate-Info',
    status: 'RESPINS',
    medieAdmitere: 5.5,
  },
  {
    liceu: 'L1',
    specializarea: 'Mate-Info',
    status: 'REUȘIT',
    medieAdmitere: 6.4,
  },
  {
    liceu: 'L1',
    specializarea: 'Științe ale naturii',
    status: 'REUȘIT',
    medieAdmitere: 7.1,
  },
  {
    liceu: 'L2',
    specializarea: 'Mate-Info',
    status: 'REUȘIT',
    medieAdmitere: 8.55,
  },
  {
    liceu: 'L2',
    specializarea: 'Științe ale naturii',
    status: 'REUȘIT',
    medieAdmitere: 9.2,
  },
];

class BacStatisticiServiceMock {
  getEleviDinJudet(code: string) {
    return of(MOCK_ELEVI as Elev[]);
  }
}

class JudeteServiceMock {
  getAllCodes() {
    return ['BV', 'B'];
  }
}

describe('StatisticiBacComponent (standalone)', () => {
  let fixture: ComponentFixture<StatisticiBacComponent>;
  let component: StatisticiBacComponent;
  let router: Router;
  let bacServiceMock: BacStatisticiServiceMock;

  beforeEach(async () => {
    bacServiceMock = new BacStatisticiServiceMock();

    await TestBed.configureTestingModule({
      imports: [StatisticiBacComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'recomandari', component: DummyComponent }]),
        provideHttpClient(),
        { provide: BacStatisticiService, useValue: bacServiceMock },
        { provide: JudeteService, useClass: JudeteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticiBacComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load initial data on init and compute aggregates', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.unitati).toContain('Toate');
    expect(component.unitati).toContain('L1');
    expect(component.unitati).toContain('L2');

    expect(component.specializari).toContain('Toate');
    expect(component.specializari).toContain('Mate-Info');
    expect(component.specializari).toContain('Științe ale naturii');

    expect(component.totalElevi).toBe(6);
    expect(component.numarReusiti).toBe(4);
    expect(component.numarRespinsi).toBe(1);
    expect(component.numarNeprezentati).toBe(1);
    expect(component.mediaGenerala).toBeCloseTo(6.13, 2);

    const data = component.pieChartData.datasets[0].data as number[];
    expect(data).toEqual([1, 1, 1, 1, 1, 1]);
  }));

  it('should filter by unitate and specializare and update chart', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.selectedUnitate = 'L1';
    component.selectedSpecializare = 'Toate';
    component.filterAndCompute();
    fixture.detectChanges();

    expect(component.totalElevi).toBe(4);
    let data = component.pieChartData.datasets[0].data as number[];
    expect(data).toEqual([1, 1, 1, 1, 0, 0]);

    component.selectedSpecializare = 'Mate-Info';
    component.filterAndCompute();
    fixture.detectChanges();

    expect(component.totalElevi).toBe(3);
    data = component.pieChartData.datasets[0].data as number[];
    expect(data).toEqual([1, 1, 1, 0, 0, 0]);
  }));

  it('should call service again when judet changes', fakeAsync(() => {
    const svc = TestBed.inject(
      BacStatisticiService
    ) as any as BacStatisticiServiceMock;
    const spy = spyOn(svc, 'getEleviDinJudet').and.callThrough();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('BV');

    component.selectedJudet = 'B';
    component.loadJudetData();
    tick();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('B');
  }));

  it('should render dropdowns and chart canvas', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('p-dropdown').length).toBe(3);
    expect(el.querySelector('canvas')).toBeTruthy();
    const btn = el.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
  }));

  it('goBack() should navigate to /recomandari', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.goBack();
    tick();
    expect(navSpy).toHaveBeenCalledWith(['/recomandari']);
  }));
});
