import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { mockTimeOffRequests } from '../../dummy-data';
import { TimeOffRequest, TimeOffRequestStatus } from '../../models';
import { RequestCardComponent } from './request-card.component';

describe('RequestCardComponent', () => {
  const decidedRequest: TimeOffRequest = {
    ...mockTimeOffRequests[0],
    status: TimeOffRequestStatus.Rejected,
    decidedByFullName: 'Lucie Králová',
    decisionNote: 'Overlaps with the year-end release.',
  };

  let fixture: ComponentFixture<RequestCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestCardComponent],
      providers: [provideIonicAngular({ useSetInputAPI: true })],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestCardComponent);
  });

  function render(request: TimeOffRequest): HTMLElement | null {
    fixture.componentRef.setInput('timeOffRequest', request);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.decision-note');
  }

  function decidedBy(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.decided-by');
  }

  it('shows the supervisor note', () => {
    const decisionNote = render(decidedRequest);

    expect(decisionNote?.textContent).toContain('Overlaps with the year-end release.');
  });

  it.each([TimeOffRequestStatus.Approved, TimeOffRequestStatus.Rejected])(
    'shows who decided on a %s request, with or without a note',
    (status) => {
      render({ ...decidedRequest, status, decisionNote: undefined });

      expect(decidedBy()?.textContent).toContain('Decided by Lucie Králová');
    },
  );

  it('shows no decider on a pending request', () => {
    render({ ...decidedRequest, status: TimeOffRequestStatus.Pending });

    expect(decidedBy()).toBeNull();
  });

  it('shows no supervisor note when there is none', () => {
    const decisionNote = render({ ...decidedRequest, decisionNote: undefined });

    expect(decisionNote).toBeNull();
  });

  it('greys out a rejected request', () => {
    render(decidedRequest);

    expect(fixture.nativeElement.querySelector('ion-card').classList).toContain('card--rejected');
  });

  it.each([TimeOffRequestStatus.Pending, TimeOffRequestStatus.Approved])('does not grey out a %s request', (status) => {
    render({ ...decidedRequest, status });

    expect(fixture.nativeElement.querySelector('ion-card').classList).not.toContain('card--rejected');
  });

  it.each([true, false])('disables the decision buttons only while busy (busy: %s)', (busy) => {
    fixture.componentRef.setInput('isSupervisor', true);
    fixture.componentRef.setInput('busy', busy);
    render({ ...decidedRequest, status: TimeOffRequestStatus.Pending });

    const buttons: HTMLIonButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('ion-button'));
    expect(buttons).toHaveLength(2);
    expect(buttons.every((button) => button.disabled === busy)).toBe(true);
  });
});
