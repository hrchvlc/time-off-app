import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllowanceSummary } from '../../models';
import { AllowanceSummaryComponent } from './allowance-summary.component';

describe('AllowanceSummaryComponent', () => {
  let fixture: ComponentFixture<AllowanceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AllowanceSummaryComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllowanceSummaryComponent);
  });

  function render(summary: AllowanceSummary): HTMLElement {
    fixture.componentRef.setInput('summary', summary);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  function barWidth(element: HTMLElement, part: 'used' | 'pending'): string {
    return element.querySelector<HTMLElement>(`.bar__${part}`)!.style.width;
  }

  it('shows the days left, used and pending', () => {
    const element = render({ allowance: 25, used: 19, pending: 5, left: 1 });

    expect(element.querySelector('.left')?.textContent).toContain('1');
    expect(element.querySelector('.left')?.textContent).toContain('left of 25');
    expect(element.querySelector('.legend__used')?.textContent).toBe('19');
    expect(element.querySelector('.legend__pending')?.textContent).toBe('5');
  });

  it('fills the bar by the share of used and pending days', () => {
    const element = render({ allowance: 25, used: 10, pending: 5, left: 10 });

    expect(barWidth(element, 'used')).toBe('40%');
    expect(barWidth(element, 'pending')).toBe('20%');
  });

  it('does not let the bar run past its end when more is pending than is left', () => {
    const element = render({ allowance: 25, used: 20, pending: 10, left: 0 });

    expect(barWidth(element, 'used')).toBe('80%');
    expect(barWidth(element, 'pending')).toBe('20%');
  });
});
