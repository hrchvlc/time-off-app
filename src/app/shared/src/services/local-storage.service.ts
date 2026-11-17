import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { dummyAccounts, mockTimeOffRequests } from '../dummy-data';
import { Account, ApiResponse, TimeOffRequest } from '../models';

const DELAY_MS = 800;
const REQUESTS_KEY = 'timeOffRequests';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  public readonly pendingCalls: WritableSignal<number> = signal(0);
  public readonly account: WritableSignal<Account | undefined> = signal<Account | undefined>(this.loadFromLocalStorage('account', undefined));
  public readonly accounts: WritableSignal<Account[]> = signal<Account[]>([]);
  public readonly employeeRequests: WritableSignal<TimeOffRequest[]> = signal<TimeOffRequest[]>([]);
  public readonly supervisorRequests: WritableSignal<TimeOffRequest[]> = signal<TimeOffRequest[]>([]);
  public readonly isLoading: Signal<boolean> = computed(() => this.pendingCalls() > 0);

  public loadAccounts(): Promise<Account[]> {
    return this.simulate(() => {
      const requests = this.loadFromLocalStorage('accounts', dummyAccounts);
      this.accounts.set(requests);
      return requests;
    });
  }

  /**
   * Employee endpoint: only the signed-in employee's requests
   */
  public loadEmployeeRequests(): Promise<TimeOffRequest[]> {
    return this.simulate(() => {
      const requests = this.filterForEmployee(this.readRequests());
      this.employeeRequests.set(requests);
      return requests;
    });
  }

  /**
   * Supervisor endpoint: requests from the whole team
   */
  public loadSupervisorRequests(): Promise<TimeOffRequest[]> {
    return this.simulate(() => {
      const requests = this.readRequests();
      this.supervisorRequests.set(requests);
      return requests;
    });
  }

  /**
   * Switch account
   */
  public changeAccount(account: Account): void {
    this.account.set(account);
    this.saveToLocalStorage('account', account);
  }

  /**
   * Log out of the current account, so no account is active until one is chosen again
   */
  public clearAccount(): void {
    this.account.set(undefined);
    localStorage.removeItem('account');
  }

  /**
   * Add a new request, so the supervisor sees it too
   */
  public async addEmployeeRequest(newRequest: TimeOffRequest): Promise<ApiResponse> {
    return this.simulate(() => {
      const updatedRequests = [ ...this.readRequests(), newRequest ];
      this.saveToLocalStorage(REQUESTS_KEY, updatedRequests);
      this.employeeRequests.set(this.filterForEmployee(updatedRequests));
      return { status: 'success', error: '' };
    });
  }

  /**
   * Edit request status, with an optional note from the supervisor, so the employee sees both
   */
  public async changeRequestStatus(changedRequest: TimeOffRequest, decisionNote?: string): Promise<ApiResponse> {
    return this.simulate(() => {
      const updatedRequests = this.readRequests().map((request) =>
        request.id === changedRequest.id ? { ...request, status: changedRequest.status, decisionNote } : request,
      );
      this.saveToLocalStorage(REQUESTS_KEY, updatedRequests);
      this.supervisorRequests.set(updatedRequests);
      return { status: 'success', error: '' };
    });
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
    this.pendingCalls.update(n => n + 1);
    try {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return action();
    } finally {
      this.pendingCalls.update(n => n - 1);
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
