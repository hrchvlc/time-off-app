import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AlertController, AlertOptions, provideIonicAngular } from '@ionic/angular';
import {
  Account,
  ApiResponse,
  dummyAccounts,
  LocalStorageService,
  mockTimeOffRequests,
  NotificationService,
  RequestCardComponent,
  Role,
  TimeOffRequest,
  TimeOffRequestDecision,
  TimeOffRequestStatus,
} from '@timeoff/shared';
import { SupervisorOverviewPage } from './supervisor-overview.page';

interface AlertResult {
  data?: { values?: { decisionNote?: string } };
  role?: string;
}

describe('SupervisorOverviewPage', () => {
  const successResponse: ApiResponse = { status: 'success', error: '' };
  const pendingRequest: TimeOffRequest = mockTimeOffRequests.find(
    (request) => request.status === TimeOffRequestStatus.Pending,
  )!;
  const approvedRequest: TimeOffRequest = { ...pendingRequest, status: TimeOffRequestStatus.Approved };
  const supervisor: Account = dummyAccounts.find((account) => account.role === Role.Supervisor)!;

  let fixture: ComponentFixture<SupervisorOverviewPage>;
  let page: SupervisorOverviewPage;
  let alertResult: AlertResult;
  let createAlert: ReturnType<typeof vi.fn<(options: AlertOptions) => Promise<unknown>>>;
  let changeRequestStatus: ReturnType<typeof vi.fn<(decision: TimeOffRequestDecision) => Promise<ApiResponse>>>;
  let loadSupervisorRequests: ReturnType<typeof vi.fn<() => Promise<TimeOffRequest[]>>>;

  beforeEach(async () => {
    alertResult = { role: 'confirm', data: { values: { decisionNote: '' } } };
    createAlert = vi.fn<(options: AlertOptions) => Promise<unknown>>().mockImplementation(async () => ({
      present: vi.fn().mockResolvedValue(undefined),
      onDidDismiss: vi.fn().mockImplementation(async () => alertResult),
    }));
    changeRequestStatus = vi
      .fn<(decision: TimeOffRequestDecision) => Promise<ApiResponse>>()
      .mockResolvedValue(successResponse);
    loadSupervisorRequests = vi.fn<() => Promise<TimeOffRequest[]>>().mockResolvedValue(mockTimeOffRequests);

    await TestBed.configureTestingModule({
      imports: [SupervisorOverviewPage],
      providers: [
        provideIonicAngular({ useSetInputAPI: true }),
        { provide: AlertController, useValue: { create: createAlert } },
        {
          provide: LocalStorageService,
          useValue: {
            account: signal(supervisor),
            allRequests: signal(mockTimeOffRequests),
            loadSupervisorRequests,
            changeRequestStatus,
          },
        },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupervisorOverviewPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** Ids of the cards currently marked busy. */
  function busyCardIds(): string[] {
    fixture.detectChanges();
    return fixture.debugElement
      .queryAll(By.directive(RequestCardComponent))
      .map((card) => card.componentInstance as RequestCardComponent)
      .filter((card) => card.busy())
      .map((card) => card.timeOffRequest().id);
  }

  /** Starts a decision and waits until it reaches the save, which the test keeps pending. */
  async function startPendingSave(): Promise<{ finishSave: (response: ApiResponse) => void; done: Promise<void> }> {
    let finishSave!: (response: ApiResponse) => void;
    changeRequestStatus.mockReturnValue(new Promise((resolve) => (finishSave = resolve)));
    const done = page.onChangeRequestStatus(approvedRequest);
    await vi.waitFor(() => expect(changeRequestStatus).toHaveBeenCalled());
    return { finishSave, done };
  }

  it('marks only the decided card as busy while its decision is saved', async () => {
    await startPendingSave();

    expect(busyCardIds()).toEqual([pendingRequest.id]);
  });

  it('marks no card as busy before any decision', () => {
    expect(busyCardIds()).toEqual([]);
  });

  it.each([successResponse, { status: 'error', error: 'Failed' } as ApiResponse])(
    'clears the busy card once the save finishes (status: $status)',
    async (response) => {
      const { finishSave, done } = await startPendingSave();

      finishSave(response);
      await done;

      expect(busyCardIds()).toEqual([]);
    },
  );

  it('marks no card as busy when the supervisor cancels', async () => {
    alertResult = { role: 'cancel' };

    await page.onChangeRequestStatus(approvedRequest);

    expect(busyCardIds()).toEqual([]);
  });

  it('asks for an optional note in the confirmation dialog', async () => {
    await page.onChangeRequestStatus(approvedRequest);

    const { inputs } = createAlert.mock.calls[0][0];
    expect(inputs).toEqual([expect.objectContaining({ name: 'decisionNote', type: 'textarea' })]);
  });

  it('saves the decision with the signed-in supervisor as decider and the note, without surrounding spaces', async () => {
    alertResult = { role: 'confirm', data: { values: { decisionNote: '  Enjoy your time off!  ' } } };

    await page.onChangeRequestStatus(approvedRequest);

    expect(changeRequestStatus).toHaveBeenCalledWith({
      requestId: pendingRequest.id,
      status: TimeOffRequestStatus.Approved,
      decidedByFullName: supervisor.name,
      decisionNote: 'Enjoy your time off!',
    } satisfies TimeOffRequestDecision);
  });

  it('saves the decision without a note when the note is blank', async () => {
    alertResult = { role: 'confirm', data: { values: { decisionNote: '   ' } } };

    await page.onChangeRequestStatus(approvedRequest);

    expect(changeRequestStatus).toHaveBeenCalledWith(expect.objectContaining({ decisionNote: undefined }));
  });

  it('loads the team requests when the page opens for a supervisor', () => {
    expect(loadSupervisorRequests).toHaveBeenCalledTimes(1);
  });

  it('does not reload the requests after saving a decision', async () => {
    loadSupervisorRequests.mockClear();

    await page.onChangeRequestStatus(approvedRequest);

    expect(changeRequestStatus).toHaveBeenCalled();
    expect(loadSupervisorRequests).not.toHaveBeenCalled();
  });

  it('saves nothing when the supervisor cancels', async () => {
    alertResult = { role: 'cancel', data: { values: { decisionNote: 'Not sent' } } };

    await page.onChangeRequestStatus(approvedRequest);

    expect(changeRequestStatus).not.toHaveBeenCalled();
  });
});
