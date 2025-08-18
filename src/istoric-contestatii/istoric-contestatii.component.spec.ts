import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';

import { IstoricContestatiiComponent } from './istoric-contestatii.component';
import {
  ContestatiiService,
  Contestatie,
} from '../services/contestatii.service';
import { of, throwError } from 'rxjs';

@Component({ standalone: true, template: '<p>Recomandari</p>' })
class DummyRecomandariComponent {}

class ContestatiiServiceMock {
  getJudete() {
    return of([
      { label: 'Brașov', value: 'BV' },
      { label: 'București', value: 'B' },
    ]);
  }

  getContestatii(an: number, judet: string) {
    const data: Contestatie[] = [
      {
        id: 'S1',
        materie: 'Matematică',
        notaInitiala: 6,
        notaDupaContestatie: 7,
        diferenta: 1,
      },
      {
        id: 'S2',
        materie: 'Matematică',
        notaInitiala: 8,
        notaDupaContestatie: 7.5,
        diferenta: -0.5,
      },
      {
        id: 'S3',
        materie: 'Matematică',
        notaInitiala: 5,
        notaDupaContestatie: 5,
        diferenta: 0,
      },
      {
        id: 'R1',
        materie: 'Limba și literatura română',
        notaInitiala: 7,
        notaDupaContestatie: 7.5,
        diferenta: 0.5,
      },
    ];
    return of(data);
  }
}

describe('IstoricContestatiiComponent (standalone)', () => {
  let fixture: ComponentFixture<IstoricContestatiiComponent>;
  let component: IstoricContestatiiComponent;
  let router: Router;
  let serviceMock: ContestatiiServiceMock;

  beforeEach(async () => {
    serviceMock = new ContestatiiServiceMock();

    await TestBed.configureTestingModule({
      imports: [IstoricContestatiiComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'recomandari', component: DummyRecomandariComponent },
        ]),
        { provide: ContestatiiService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IstoricContestatiiComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load counties (judete) on init', () => {
    expect(component.judete.length).toBeGreaterThan(0);
    expect(component.judete.map((j) => j.label)).toContain('Brașov');
  });

  it('should not show charts/stats until all three filters are selected', () => {
    expect(component.selectedYear).toBeTruthy();
    expect(component.selectedJudet).toBeNull();
    expect(component.selectedSubject).toBeNull();
    expect(component.afiseazaStatistici).toBeFalse();
    expect(component.chartData.length).toBe(0);
    expect(component.deviationChartData.length).toBe(0);
  });

  it('happy path: selecting year, county, subject computes stats and populates chart datasets', fakeAsync(() => {
    const year = component.years.find((y) => y.value === 2024)!;
    const judet = component.judete.find((j) => j.value === 'BV')!;
    const subject = component.subjects.find((s) => s.value === 'Matematică')!;

    component.onYearChange(year);
    component.onJudetChange(judet);
    component.onSubjectChange(subject);

    tick();
    fixture.detectChanges();

    expect(component.afiseazaStatistici).toBeTrue();

    expect(component.total).toBe(3);
    expect(component.noteCrescute).toBe(1);
    expect(component.noteScazute).toBe(1);
    expect(component.noteNeschimbate).toBe(1);
    expect(component.diferentaMedie).toBeCloseTo(0.1666, 3);

    expect(component.chartLabels.length).toBe(3);
    expect(component.chartData.length).toBe(2);
    expect(component.chartData[0].label).toContain('inițială');
    expect(component.chartData[1].label).toContain('după contestație');

    expect(component.deviationChartLabels.length).toBe(3);
    expect(component.deviationChartData.length).toBe(1);
    expect((component.deviationChartData[0].data as number[]).length).toBe(3);
  }));

  it('error path: getContestatii throws → charts cleared and stats hidden', fakeAsync(() => {
    spyOn(serviceMock, 'getContestatii').and.returnValue(
      throwError(() => new Error('boom'))
    );

    const year = component.years.find((y) => y.value === 2024)!;
    const judet = component.judete.find((j) => j.value === 'BV')!;
    const subject = component.subjects.find((s) => s.value === 'Matematică')!;

    component.onYearChange(year);
    component.onJudetChange(judet);
    component.onSubjectChange(subject);

    tick();
    fixture.detectChanges();

    expect(component.afiseazaStatistici).toBeFalse();
    expect(component.chartData.length).toBe(0);
    expect(component.deviationChartData.length).toBe(0);
  }));

  it('should render tabView after filters selected (under *ngIf)', fakeAsync(() => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('p-tabview')).toBeFalsy();

    const year = component.years.find((y) => y.value === 2024)!;
    const judet = component.judete.find((j) => j.value === 'BV')!;
    const subject = component.subjects.find((s) => s.value === 'Matematică')!;

    component.onYearChange(year);
    component.onJudetChange(judet);
    component.onSubjectChange(subject);

    tick();
    fixture.detectChanges();

    expect(el.querySelector('p-tabview')).toBeTruthy();
  }));

  it('goBack() should navigate to /recomandari', fakeAsync(() => {
    const navSpy = spyOn(router, 'navigate').and.callThrough();
    component.goBack();
    tick();
    expect(navSpy).toHaveBeenCalledWith(['/recomandari']);
  }));
});
