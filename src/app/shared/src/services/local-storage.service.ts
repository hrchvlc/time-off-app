import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { dummyAccounts, mockTimeOffRequests } from '../dummy-data';
import { Account, ApiResponse, TimeOffRequest, TimeOffRequestDecision } from '../models';

const DELAY_MS = 800;
const REQUESTS_KEY = 'timeOffRequests';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  public readonly pendingCalls: WritableSignal<number> = signal(0);
  public readonly account: WritableSignal<Account | undefined> = signal<Account | undefined>(
    this.loadFromLocalStorage('account', undefined),
  );
  public readonly accounts: WritableSignal<Account[]> = signal<Account[]>([]);
  public readonly allRequests: WritableSignal<TimeOffRequest[]> = signal<TimeOffRequest[]>([]);
  public readonly isLoading: Signal<boolean> = computed(() => this.pendingCalls() > 0);

  public loadAccounts(): Promise<Account[]> {
    return this.simulate(() => {
      this.accounts.set(dummyAccounts);
      return this.accounts();
    });
  }

  /**
   * Employee endpoint: only the signed-in employee's requests
   */
  public loadEmployeeRequests(): Promise<TimeOffRequest[]> {
    return this.simulate(() => {
      const requests = this.filterForEmployee(this.readRequests());
      this.allRequests.set(requests);
      return requests;
    });
  }

  /**
   * Supervisor endpoint: requests from the whole team
   */
  public loadSupervisorRequests(): Promise<TimeOffRequest[]> {
    return this.simulate(() => {
      const requests = this.readRequests();
      this.allRequests.set(requests);
      return requests;
    });
  }

  /**
   * Switch account
   */
  public changeAccount(account: Account): void {
    if (account.id === this.account()?.id) {
      return;
    }
    this.account.set(account);
    this.allRequests.set([]);
    this.saveToLocalStorage('account', account);
  }

  /**
   * Log out of the current account, so no account is active until one is chosen again
   */
  public clearAccount(): void {
    this.account.set(undefined);
    this.allRequests.set([]);
    localStorage.removeItem('account');
  }

  /**
   * Add a new request, so the supervisor sees it too
   */
  public async addEmployeeRequest(newRequest: TimeOffRequest): Promise<ApiResponse> {
    return this.simulate(() => {
      const response = this.saveRequests([...this.readRequests(), newRequest]);
      if (response.status === 'success') {
        this.allRequests.update((requests) => [...requests, newRequest]);
      }
      return response;
    });
  }

  /**
   * Save a supervisor's decision on a request, so the employee sees the new status, who decided and the note
   */
  public async changeRequestStatus(decision: TimeOffRequestDecision): Promise<ApiResponse> {
    return this.simulate(() => {
      const { requestId, status, decidedByFullName, decisionNote } = decision;
      const applyDecision = (request: TimeOffRequest): TimeOffRequest =>
        request.id === requestId ? { ...request, status, decidedByFullName, decisionNote } : request;
      const response = this.saveRequests(this.readRequests().map(applyDecision));
      if (response.status === 'success') {
        this.allRequests.update((requests) => requests.map(applyDecision));
      }
      return response;
    });
  }

  /**
   * Saving fails when storage is full or blocked; that comes back as an error response instead of a thrown error,
   * so callers handle every failure in one place
   */
  private saveRequests(requests: TimeOffRequest[]): ApiResponse {
    try {
      this.saveToLocalStorage(REQUESTS_KEY, requests);
      return { status: 'success', error: '' };
    } catch {
      return { status: 'error', error: 'Requests could not be saved.' };
    }
  }

  /**
   * Reads the stored list on every call, so writes always build on the latest saved data
   */
  private readRequests(): TimeOffRequest[] {
    return this.loadFromLocalStorage(REQUESTS_KEY, mockTimeOffRequests);
  }

  private filterForEmployee(requests: TimeOffRequest[]): TimeOffRequest[] {
    return requests.filter((request) => request.employeeId === this.account()?.id);
  }

  private async simulate<T = void>(action: () => T, delayMs: number = DELAY_MS): Promise<T> {
    this.pendingCalls.update((n) => n + 1);
    try {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return action();
    } finally {
      this.pendingCalls.update((n) => n - 1);
    }
  }

  /**
   * Reads a saved value, a value that cannot be parsed is removed and the fallback is used instead
   */
  private loadFromLocalStorage<T>(key: string, fallback: T): T {
    const savedValue = localStorage.getItem(key);
    if (!savedValue) {
      return fallback;
    }
    try {
      return JSON.parse(savedValue);
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  }

  private saveToLocalStorage(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
