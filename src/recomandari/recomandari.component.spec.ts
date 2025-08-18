import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RecomandariComponent } from './recomandari.component';

@Component({ standalone: true, template: '<p>Dummy</p>' })
class DummyComponent {}

describe('RecomandariComponent (standalone)', () => {
  let fixture: ComponentFixture<RecomandariComponent>;
  let component: RecomandariComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecomandariComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'recomandari-liceu', component: DummyComponent },
          { path: 'statistici-bac', component: DummyComponent },
          { path: 'istoric-contestatii', component: DummyComponent },
          { path: 'grad-ocupare', component: DummyComponent },
          { path: 'ultimul-admis', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RecomandariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all images and buttons', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
    const srcs = imgs.map((i) => i.getAttribute('src'));
    expect(srcs).toEqual(
      jasmine.arrayContaining([
        'liceu.png',
        'bac.png',
        'contestatii.png',
        'grad_ocupare.png',
        'ultimul_admis.png',
      ])
    );

    const buttons = Array.from(
      el.querySelectorAll('button[type="button"]')
    ) as HTMLButtonElement[];
    expect(buttons.length).toBe(5);

    const labels = buttons
      .map((b) => b.querySelector('.p-button-label')?.textContent?.trim())
      .filter(Boolean);

    expect(labels).toEqual(
      jasmine.arrayContaining([
        'Vezi liceele recomandate',
        'Vezi statistici BAC',
        'Vezi contestațiile',
        'Vezi gradul de ocupare',
        'Vezi ultimul admis',
      ])
    );
  });

  it('click "Vezi liceele recomandate" navigates to /recomandari-liceu', async () => {
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const btn = getButtonByLabel(fixture, 'Vezi liceele recomandate');
    expect(btn).toBeTruthy();
    btn!.click();
    expect(navSpy).toHaveBeenCalledWith(['/recomandari-liceu']);
  });

  it('click "Vezi statistici BAC" navigates to /statistici-bac', async () => {
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const btn = getButtonByLabel(fixture, 'Vezi statistici BAC');
    expect(btn).toBeTruthy();
    btn!.click();
    expect(navSpy).toHaveBeenCalledWith(['/statistici-bac']);
  });

  it('click "Vezi contestațiile" navigates to /istoric-contestatii', async () => {
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const btn = getButtonByLabel(fixture, 'Vezi contestațiile');
    expect(btn).toBeTruthy();
    btn!.click();
    expect(navSpy).toHaveBeenCalledWith(['/istoric-contestatii']);
  });

  it('click "Vezi gradul de ocupare" navigates to /grad-ocupare', async () => {
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const btn = getButtonByLabel(fixture, 'Vezi gradul de ocupare');
    expect(btn).toBeTruthy();
    btn!.click();
    expect(navSpy).toHaveBeenCalledWith(['/grad-ocupare']);
  });

  it('click "Vezi ultimul admis" navigates to /ultimul-admis', async () => {
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const btn = getButtonByLabel(fixture, 'Vezi ultimul admis');
    expect(btn).toBeTruthy();
    btn!.click();
    expect(navSpy).toHaveBeenCalledWith(['/ultimul-admis']);
  });

  it('public methods should call router.navigate with correct paths', async () => {
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.goToLicee();
    component.goToBac();
    component.goToContestatii();
    component.goToOcupare();
    component.goToUltimulAdmis();

    expect(navSpy.calls.allArgs()).toEqual([
      [['/recomandari-liceu']],
      [['/statistici-bac']],
      [['/istoric-contestatii']],
      [['/grad-ocupare']],
      [['/ultimul-admis']],
    ]);
  });
});

function getButtonByLabel(
  fixture: ComponentFixture<any>,
  label: string
): HTMLButtonElement | null {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button[type="button"]')
  ) as HTMLButtonElement[];
  return (
    buttons.find(
      (b) => b.querySelector('.p-button-label')?.textContent?.trim() === label
    ) || null
  );
}
