import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController, provideIonicAngular } from '@ionic/angular';
import {
  Account,
  dummyAccounts,
  LocalStorageService,
  mockTimeOffRequests,
  NotificationService,
  Role,
  TimeOffRequest,
  TimeOffRequestStatus,
} from '@timeoff/shared';
import { EmployeeOverviewPage } from './employee-overview.page';

describe('EmployeeOverviewPage', () => {
  const employee: Account = {
    ...dummyAccounts.find((account) => account.role === Role.Employee)!,
    timeOffAllowance: 2,
  };

  let fixture: ComponentFixture<EmployeeOverviewPage>;
  let account: WritableSignal<Account | undefined>;
  let allRequests: WritableSignal<TimeOffRequest[]>;

  function createRequest(overrides: Partial<TimeOffRequest>): TimeOffRequest {
    return { ...mockTimeOffRequests[0], employeeId: employee.id, ...overrides };
  }

  /** An approved request that already happened, so it uses days without showing under Upcoming. */
  function pastRequest(workingDays: number): TimeOffRequest {
    return createRequest({
      id: `past-${workingDays}`,
      startDate: '2020-03-02',
      endDate: '2020-03-03',
      status: TimeOffRequestStatus.Approved,
      workingDays,
    });
  }

  async function render(signedIn: Account, requests: TimeOffRequest[]): Promise<void> {
    account = signal<Account | undefined>(signedIn);
    allRequests = signal(requests);

    await TestBed.configureTestingModule({
      imports: [EmployeeOverviewPage],
      providers: [
        provideIonicAngular({ useSetInputAPI: true }),
        {
          provide: LocalStorageService,
          useValue: { account, allRequests, loadEmployeeRequests: vi.fn().mockResolvedValue(requests) },
        },
        { provide: ModalController, useValue: { create: vi.fn() } },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeOverviewPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /**
   * Ionic does not update the `disabled` attribute in jsdom,
   * so tests check the property that Angular's [disabled] binding sets.
   */
  function requestButton(): HTMLIonButtonElement {
    return fixture.nativeElement.querySelector('ion-footer ion-button');
  }

  function emptyStateText(): string | undefined {
    return fixture.nativeElement.querySelector('app-empty-state')?.textContent;
  }

  it('enables "Request time off" while days are left', async () => {
    await render(employee, [pastRequest(1)]);

    expect(requestButton().disabled).toBe(false);
    expect(emptyStateText()).toContain('You can create a new request below');
  });

  it('keeps "Request time off" visible but disabled once no days are left', async () => {
    await render(employee, [pastRequest(2)]);

    expect(requestButton()).not.toBeNull();
    expect(requestButton().disabled).toBe(true);
    expect(emptyStateText()).toContain('No upcoming time off');
    expect(emptyStateText()).not.toContain('You can create a new request below');
  });

  it('enables "Request time off" for an account without an allowance, as there is no limit', async () => {
    await render({ ...employee, timeOffAllowance: undefined }, [pastRequest(2)]);

    expect(requestButton().disabled).toBe(false);
  });
});
