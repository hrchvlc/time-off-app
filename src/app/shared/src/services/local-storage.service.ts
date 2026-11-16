import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { dummyAccounts, mockTimeOffEmployeeRequests, mockTimeOffSupervisorRequests } from '../dummy-data';
import { Account, ApiResponse, TimeOffRequest } from '../models';

const DELAY_MS = 800;

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

  public loadEmployeeRequests(): Promise<TimeOffRequest[]> {
    return this.simulate(() => {
      const requests = this.loadFromLocalStorage('employeeRequests', mockTimeOffEmployeeRequests);
      this.employeeRequests.set(requests);
      return requests;
    });
  }

  public loadSupervisorRequests(): Promise<TimeOffRequest[]> {
    return this.simulate(() => {
      const requests = this.loadFromLocalStorage('supervisorRequests', mockTimeOffSupervisorRequests);
      this.supervisorRequests.set(requests);
      return requests;
    });
  }

  /**
   * Switch account
   */
  public async changeAccount(account: Account): Promise<void> {
    return this.simulate(() => {
      this.account.set(account);
      this.saveToLocalStorage('account', this.account());
    });
  }

  /**
   * Add request to the employee list
   */
  public async addEmployeeRequest(newRequest: TimeOffRequest): Promise<ApiResponse> {
    return this.simulate(() => {
      this.employeeRequests.update(list => [...list, newRequest]);
      this.saveToLocalStorage('employeeRequests', this.employeeRequests());
      return { status: 'success', error: '' };
    });
  }

  /**
   * Edit request status
   */
  public async changeRequestStatus(editRequest: TimeOffRequest): Promise<ApiResponse> {
    return this.simulate(() => {
      this.supervisorRequests.update(requests =>
        requests.map(r =>
          r.id === editRequest.id ? { ...r, status: editRequest.status } : r
        )
      );
      this.saveToLocalStorage('supervisorRequests', this.supervisorRequests());
      return { status: 'success', error: '' };
    });
  }

  private async simulate<T = void>(action: () => T, delayMs = DELAY_MS): Promise<T> {
    this.pendingCalls.update(n => n + 1);
    try {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return action();
    } finally {
      this.pendingCalls.update(n => n - 1);
    }
  }

  private loadFromLocalStorage<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }

  private saveToLocalStorage(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
