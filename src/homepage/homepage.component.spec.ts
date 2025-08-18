import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HomepageComponent } from './homepage.component';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '<p>Recomandari</p>' })
class DummyRecomandariComponent {}

describe('HomepageComponent (standalone)', () => {
  let fixture: ComponentFixture<HomepageComponent>;
  let component: HomepageComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'recomandari', component: DummyRecomandariComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show intro overlay initially, then hide it after 3s', fakeAsync(() => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.fixed.inset-0')).toBeTruthy();

    tick(3000);
    fixture.detectChanges();

    expect(el.querySelector('.fixed.inset-0')).toBeFalsy();
    expect(component.showIntro).toBeFalse();
  }));

  it('should close intro on window click via HostListener', () => {
    component.showIntro = true;
    fixture.detectChanges();

    window.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(component.showIntro).toBeFalse();
  });

  it('should close intro on window scroll via HostListener', () => {
    component.showIntro = true;
    fixture.detectChanges();

    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.showIntro).toBeFalse();
  });

  it('should navigate to /recomandari when clicking "Începe acum"', fakeAsync(() => {
    const navSpy = spyOn(router, 'navigate').and.callThrough();

    const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[type="button"]'
    );
    expect(btn).withContext('Start button not found').toBeTruthy();

    btn!.click();
    tick();
    expect(navSpy).toHaveBeenCalledWith(['/recomandari']);
  }));

  it('should render the CTA button and the illustration image', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const btn = el.querySelector(
      'button[type="button"]'
    ) as HTMLButtonElement | null;
    expect(btn).toBeTruthy();

    const label = btn?.querySelector('.p-button-label') as HTMLElement | null;
    expect(label).toBeTruthy();
    expect(label!.textContent?.trim()).toBe('Începe acum');

    const img = el.querySelector('img') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('/student-illustration.png');
    expect(img!.getAttribute('alt')).toContain('Ilustrație');
  });
});
