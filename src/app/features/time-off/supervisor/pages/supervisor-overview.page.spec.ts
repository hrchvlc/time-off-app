import { TestBed } from '@angular/core/testing';
import { AlertController, AlertOptions, provideIonicAngular } from '@ionic/angular';
import {
  ApiResponse,
  LocalStorageService,
  mockTimeOffRequests,
  NotificationService,
  TimeOffRequest,
  TypeOffRequestStatus,
} from '@timeoff/shared';
import { SupervisorOverviewPage } from './supervisor-overview.page';

interface AlertResult {
  data?: { values?: { decisionNote?: string } };
  role?: string;
}

describe('SupervisorOverviewPage', () => {
  const successResponse: ApiResponse = { status: 'success', error: '' };
  const pendingRequest: TimeOffRequest = mockTimeOffRequests.find(
    (request) => request.status === TypeOffRequestStatus.Pending,
  )!;
  const approvedRequest: TimeOffRequest = { ...pendingRequest, status: TypeOffRequestStatus.Approved };

  let page: SupervisorOverviewPage;
  let alertResult: AlertResult;
  let createAlert: ReturnType<typeof vi.fn<(options: AlertOptions) => Promise<unknown>>>;
  let changeRequestStatus: ReturnType<typeof vi.fn<(request: TimeOffRequest, decisionNote?: string) => Promise<ApiResponse>>>;

  beforeEach(async () => {
    alertResult = { role: 'confirm', data: { values: { decisionNote: '' } } };
    createAlert = vi.fn<(options: AlertOptions) => Promise<unknown>>().mockImplementation(async () => ({
      present: vi.fn().mockResolvedValue(undefined),
      onDidDismiss: vi.fn().mockImplementation(async () => alertResult),
    }));
    changeRequestStatus = vi.fn<(request: TimeOffRequest, decisionNote?: string) => Promise<ApiResponse>>()
      .mockResolvedValue(successResponse);

    await TestBed.configureTestingModule({
      imports: [ SupervisorOverviewPage ],
      providers: [
        provideIonicAngular({ useSetInputAPI: true }),
        { provide: AlertController, useValue: { create: createAlert } },
        {
          provide: LocalStorageService,
          useValue: {
            loadSupervisorRequests: vi.fn().mockResolvedValue(mockTimeOffRequests),
            changeRequestStatus,
          },
        },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SupervisorOverviewPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('asks for an optional note in the confirmation dialog', async () => {
    await page.onChangeRequestStatus(approvedRequest);

    const { inputs } = createAlert.mock.calls[0][0];
    expect(inputs).toEqual([
      expect.objectContaining({ name: 'decisionNote', type: 'textarea' }),
    ]);
  });

  it('saves the decision with the note, without surrounding spaces', async () => {
    alertResult = { role: 'confirm', data: { values: { decisionNote: '  Enjoy your time off!  ' } } };

    await page.onChangeRequestStatus(approvedRequest);

    expect(changeRequestStatus).toHaveBeenCalledWith(approvedRequest, 'Enjoy your time off!');
  });

  it('saves the decision without a note when the note is blank', async () => {
    alertResult = { role: 'confirm', data: { values: { decisionNote: '   ' } } };

    await page.onChangeRequestStatus(approvedRequest);

    expect(changeRequestStatus).toHaveBeenCalledWith(approvedRequest, undefined);
  });

  it('saves nothing when the supervisor cancels', async () => {
    alertResult = { role: 'cancel', data: { values: { decisionNote: 'Not sent' } } };

    await page.onChangeRequestStatus(approvedRequest);

    expect(changeRequestStatus).not.toHaveBeenCalled();
  });
});
