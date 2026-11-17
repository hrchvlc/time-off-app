import { TestBed } from '@angular/core/testing';
import { dummyAccounts, mockTimeOffRequests } from '../dummy-data';
import { Account, Role, TimeOffRequest, TypeOffRequestStatus } from '../models';
import { LocalStorageService } from './local-storage.service';

const SIMULATED_DELAY_MS: number = 800;
const REQUESTS_KEY: string = 'timeOffRequests';
const anna: Account = dummyAccounts.find((account) => account.id === 'emp-101')!;
const supervisor: Account = dummyAccounts.find((account) => account.role === Role.Supervisor)!;
const annasMockRequests: TimeOffRequest[] = mockTimeOffRequests.filter((request) => request.employeeId === anna.id);

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Created per test, because the service reads the saved account from localStorage on creation. */
  function createService(): LocalStorageService {
    return TestBed.inject(LocalStorageService);
  }

  /** Skips the simulated network delay and returns the call's result. */
  async function skipDelay<T>(pendingCall: Promise<T>): Promise<T> {
    await vi.advanceTimersByTimeAsync(SIMULATED_DELAY_MS);
    return pendingCall;
  }

  function createRequest(overrides: Partial<TimeOffRequest> = {}): TimeOffRequest {
    return { ...annasMockRequests[0], id: 'req-new', ...overrides };
  }

  function savedRequests(): TimeOffRequest[] {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY)!);
  }

  describe('loading data', () => {
    it('returns only the signed-in employee\'s mock requests when nothing is saved', async () => {
      const service = createService();
      service.changeAccount(anna);

      const loadedRequests = await skipDelay(service.loadEmployeeRequests());

      expect(loadedRequests).toEqual(annasMockRequests);
      expect(service.employeeRequests()).toEqual(annasMockRequests);
    });

    it('returns no employee requests when no one is signed in', async () => {
      const service = createService();

      const loadedRequests = await skipDelay(service.loadEmployeeRequests());

      expect(loadedRequests).toEqual([]);
    });

    it('loads employee requests saved in localStorage', async () => {
      const otherEmployeesRequest = createRequest({ id: 'req-other', employeeId: 'emp-999' });
      const annasRequest = createRequest();
      localStorage.setItem(REQUESTS_KEY, JSON.stringify([ otherEmployeesRequest, annasRequest ]));
      const service = createService();
      service.changeAccount(anna);

      const loadedRequests = await skipDelay(service.loadEmployeeRequests());

      expect(loadedRequests).toEqual([ annasRequest ]);
    });

    it('falls back to mock data and removes a corrupted saved value', async () => {
      localStorage.setItem(REQUESTS_KEY, '{ not valid json');
      const service = createService();

      const loadedRequests = await skipDelay(service.loadSupervisorRequests());

      expect(loadedRequests).toEqual(mockTimeOffRequests);
      expect(localStorage.getItem(REQUESTS_KEY)).toBeNull();
    });

    it('returns all mock requests to the supervisor when nothing is saved', async () => {
      const service = createService();

      const loadedRequests = await skipDelay(service.loadSupervisorRequests());

      expect(loadedRequests).toEqual(mockTimeOffRequests);
      expect(service.supervisorRequests()).toEqual(mockTimeOffRequests);
    });

    it('falls back to dummy accounts when nothing is saved', async () => {
      const service = createService();

      const loadedAccounts = await skipDelay(service.loadAccounts());

      expect(loadedAccounts).toEqual(dummyAccounts);
      expect(service.accounts()).toEqual(dummyAccounts);
    });
  });

  describe('simulated delay', () => {
    it('resolves only after the simulated delay', async () => {
      const service = createService();
      const onLoaded = vi.fn();

      service.loadEmployeeRequests().then(onLoaded);
      await vi.advanceTimersByTimeAsync(SIMULATED_DELAY_MS - 1);
      expect(onLoaded).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(onLoaded).toHaveBeenCalled();
    });

    it('reports loading while a call is pending', async () => {
      const service = createService();

      const pendingCall = service.loadEmployeeRequests();
      expect(service.isLoading()).toBe(true);

      await skipDelay(pendingCall);
      expect(service.isLoading()).toBe(false);
    });

    it('keeps loading until every pending call is finished', async () => {
      const service = createService();

      service.loadEmployeeRequests();
      await vi.advanceTimersByTimeAsync(SIMULATED_DELAY_MS / 2);
      const secondCall = service.loadAccounts();

      await vi.advanceTimersByTimeAsync(SIMULATED_DELAY_MS / 2);
      expect(service.isLoading()).toBe(true);

      await skipDelay(secondCall);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('account', () => {
    it('has no account when nothing is saved', () => {
      const service = createService();

      expect(service.account()).toBeUndefined();
    });

    it('saves the chosen account', () => {
      const service = createService();
      const employeeAccount = dummyAccounts[0];

      service.changeAccount(employeeAccount);

      expect(service.account()).toEqual(employeeAccount);
      expect(JSON.parse(localStorage.getItem('account')!)).toEqual(employeeAccount);
    });

    it('restores the saved account on startup', () => {
      localStorage.setItem('account', JSON.stringify(dummyAccounts[1]));

      const service = createService();

      expect(service.account()).toEqual(dummyAccounts[1]);
    });

    it('starts without an account when the saved account is corrupted', () => {
      localStorage.setItem('account', '{ not valid json');

      const service = createService();

      expect(service.account()).toBeUndefined();
      expect(localStorage.getItem('account')).toBeNull();
    });

    it('clears the active account and its saved value', () => {
      const service = createService();
      service.changeAccount(dummyAccounts[0]);

      service.clearAccount();

      expect(service.account()).toBeUndefined();
      expect(localStorage.getItem('account')).toBeNull();
    });
  });

  describe('addEmployeeRequest', () => {
    it('adds the request to the list and saves it', async () => {
      const service = createService();
      service.changeAccount(anna);
      const newRequest = createRequest();

      const response = await skipDelay(service.addEmployeeRequest(newRequest));

      expect(response.status).toBe('success');
      expect(savedRequests()).toEqual([ ...mockTimeOffRequests, newRequest ]);
      expect(service.employeeRequests()).toEqual([ ...annasMockRequests, newRequest ]);
    });

    it('keeps requests added earlier', async () => {
      const service = createService();
      const firstRequest = createRequest({ id: 'req-first' });
      const secondRequest = createRequest({ id: 'req-second' });

      await skipDelay(service.addEmployeeRequest(firstRequest));
      await skipDelay(service.addEmployeeRequest(secondRequest));

      expect(savedRequests()).toEqual([ ...mockTimeOffRequests, firstRequest, secondRequest ]);
    });

    it('does not change the mock data', async () => {
      const service = createService();
      const mockRequestCount = mockTimeOffRequests.length;

      await skipDelay(service.addEmployeeRequest(createRequest()));

      expect(mockTimeOffRequests.length).toBe(mockRequestCount);
    });
  });

  describe('changeRequestStatus', () => {
    const pendingRequest: TimeOffRequest = mockTimeOffRequests.find((request) => request.status === TypeOffRequestStatus.Pending)!;

    it('changes the status of the matching request only and saves it', async () => {
      const service = createService();
      const [ changedRequest, ...otherRequests ] = mockTimeOffRequests;
      const newStatus = changedRequest.status === TypeOffRequestStatus.Approved
        ? TypeOffRequestStatus.Rejected
        : TypeOffRequestStatus.Approved;

      const response = await skipDelay(service.changeRequestStatus({ ...changedRequest, status: newStatus }));

      expect(response.status).toBe('success');
      expect(service.supervisorRequests()[0].status).toBe(newStatus);
      expect(service.supervisorRequests().slice(1)).toEqual(otherRequests);
      expect(savedRequests()).toEqual(service.supervisorRequests());
    });

    it('saves the supervisor note with the decision', async () => {
      const service = createService();

      await skipDelay(service.changeRequestStatus({ ...pendingRequest, status: TypeOffRequestStatus.Rejected }, 'Team is short-staffed that week.'));

      const decidedRequest = service.supervisorRequests().find((request) => request.id === pendingRequest.id)!;
      expect(decidedRequest.decisionNote).toBe('Team is short-staffed that week.');
      const savedRequest = savedRequests().find((request) => request.id === pendingRequest.id)!;
      expect(savedRequest.decisionNote).toBe('Team is short-staffed that week.');
    });

    it('saves no note when the supervisor leaves it empty', async () => {
      const service = createService();

      await skipDelay(service.changeRequestStatus({ ...pendingRequest, status: TypeOffRequestStatus.Approved }));

      const decidedRequest = service.supervisorRequests().find((request) => request.id === pendingRequest.id)!;
      expect(decidedRequest.decisionNote).toBeUndefined();
    });
  });

  describe('shared between employee and supervisor', () => {
    it('shows a request submitted by an employee to the supervisor', async () => {
      const service = createService();
      service.changeAccount(anna);
      const newRequest = createRequest({ id: 'req-from-anna', status: TypeOffRequestStatus.Pending });
      await skipDelay(service.addEmployeeRequest(newRequest));

      service.changeAccount(supervisor);
      const supervisorRequests = await skipDelay(service.loadSupervisorRequests());

      expect(supervisorRequests).toContainEqual(newRequest);
    });

    it('shows the supervisor decision and note to the employee', async () => {
      const service = createService();
      const annasPendingRequest = annasMockRequests.find((request) => request.status === TypeOffRequestStatus.Pending)!;
      service.changeAccount(supervisor);
      await skipDelay(service.changeRequestStatus(
        { ...annasPendingRequest, status: TypeOffRequestStatus.Approved },
        'Enjoy your day off.',
      ));

      service.changeAccount(anna);
      const employeeRequests = await skipDelay(service.loadEmployeeRequests());

      const decidedRequest = employeeRequests.find((request) => request.id === annasPendingRequest.id)!;
      expect(decidedRequest.status).toBe(TypeOffRequestStatus.Approved);
      expect(decidedRequest.decisionNote).toBe('Enjoy your day off.');
    });
  });
});
