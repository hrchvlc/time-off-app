import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { dummyAccounts, LocalStorageService } from '@timeoff/shared';
import { AppComponent } from './app.component';

const SIMULATED_DELAY_MS: number = 800;

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideIonicAngular({ useSetInputAPI: true })],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads the demo accounts on start', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    fixture.detectChanges();
    expect(app.demoAccounts()).toEqual([]);

    await vi.advanceTimersByTimeAsync(SIMULATED_DELAY_MS);

    expect(app.demoAccounts()).toEqual(dummyAccounts);
  });

  it('marks only the active account in the menu', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(SIMULATED_DELAY_MS);

    TestBed.inject(LocalStorageService).changeAccount(dummyAccounts[1]);
    fixture.detectChanges();

    const current: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('ion-item[aria-current="true"]'));

    expect(current).toHaveLength(1);
    expect(current[0].textContent).toContain(dummyAccounts[1].name);
    expect(current[0].querySelector('.check')).not.toBeNull();
  });

  it('links the menu title to the home page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('ion-menu a.title');

    expect(title.getAttribute('href')).toBe('/');
  });

  it('places the router outlet outside any ion-content', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const routerOutlet: HTMLElement = fixture.nativeElement.querySelector('ion-router-outlet');

    expect(routerOutlet.closest('ion-content')).toBeNull();
  });
});
