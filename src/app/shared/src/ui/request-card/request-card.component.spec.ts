import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { mockTimeOffRequests } from '../../dummy-data';
import { TimeOffRequest, TypeOffRequestStatus } from '../../models';
import { RequestCardComponent } from './request-card.component';

describe('RequestCardComponent', () => {
  const decidedRequest: TimeOffRequest = {
    ...mockTimeOffRequests[0],
    status: TypeOffRequestStatus.Rejected,
    decidedByFullName: 'Lucie Králová',
    decisionNote: 'Overlaps with the year-end release.',
  };

  let fixture: ComponentFixture<RequestCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RequestCardComponent ],
      providers: [ provideIonicAngular({ useSetInputAPI: true }) ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestCardComponent);
  });

  function render(request: TimeOffRequest): HTMLElement | null {
    fixture.componentRef.setInput('timeOffRequest', request);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.decision-note');
  }

  it('shows the supervisor note with who wrote it', () => {
    const decisionNote = render(decidedRequest);

    expect(decisionNote?.textContent).toContain('Lucie Králová:');
    expect(decisionNote?.textContent).toContain('Overlaps with the year-end release.');
  });

  it('falls back to "Supervisor" when the author is unknown', () => {
    const decisionNote = render({ ...decidedRequest, decidedByFullName: undefined });

    expect(decisionNote?.textContent).toContain('Supervisor:');
  });

  it('shows no supervisor note when there is none', () => {
    const decisionNote = render({ ...decidedRequest, decisionNote: undefined });

    expect(decisionNote).toBeNull();
  });

  it('greys out a rejected request', () => {
    render(decidedRequest);

    expect(fixture.nativeElement.querySelector('ion-card').classList).toContain('card--rejected');
  });

  it.each([ TypeOffRequestStatus.Pending, TypeOffRequestStatus.Approved ])('does not grey out a %s request', (status) => {
    render({ ...decidedRequest, status });

    expect(fixture.nativeElement.querySelector('ion-card').classList).not.toContain('card--rejected');
  });
});
