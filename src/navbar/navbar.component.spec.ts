import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '<p>Dummy</p>' })
class DummyComponent {}

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'recomandari', component: DummyComponent },
          { path: 'recomandari-liceu', component: DummyComponent },
          { path: 'statistici-bac', component: DummyComponent },
          { path: 'istoric-contestatii', component: DummyComponent },
          { path: 'grad-ocupare', component: DummyComponent },
          { path: 'ultimul-admis', component: DummyComponent },
          { path: 'contact', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigateTo should call router.navigate if different path', async () => {
    spyOn(router, 'navigate').and.callThrough();

    await component.navigateTo('/recomandari');
    expect(router.navigate).toHaveBeenCalledWith(['/recomandari']);
  });

  it('navigateTo should not navigate if already on the same path', async () => {
    await router.navigate(['/contact']);
    fixture.detectChanges();

    spyOn(router, 'navigate').and.callThrough();

    await component.navigateTo('/contact');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('clicking logo should navigate to /', async () => {
    spyOn(component, 'navigateTo');
    const logoEl: HTMLElement =
      fixture.nativeElement.querySelector('.text-2xl');
    logoEl.click();
    expect(component.navigateTo).toHaveBeenCalledWith('/');
  });

  it('clicking "Contact" link should call navigateTo("/contact")', () => {
    spyOn(component, 'navigateTo');

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a.cursor-pointer')
    ) as HTMLAnchorElement[];

    const contactLink = links.find((a) => a.textContent?.trim() === 'Contact');
    expect(contactLink).withContext('Contact link not found').toBeTruthy();

    contactLink!.click();

    expect(component.navigateTo).toHaveBeenCalledWith('/contact');
  });
});
