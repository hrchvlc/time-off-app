import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { dummyAccounts } from '../dummy-data';
import { Account, Role } from '../models';
import { LocalStorageService } from '../services';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  const employee: Account = dummyAccounts.find((account) => account.role === Role.Employee)!;
  const supervisor: Account = dummyAccounts.find((account) => account.role === Role.Supervisor)!;

  let account: WritableSignal<Account | undefined>;

  beforeEach(() => {
    account = signal<Account | undefined>(undefined);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: LocalStorageService, useValue: { account } }],
    });
  });

  /** Runs the guard for a page and returns true or the URL it redirects to. */
  function runGuard(role: Role): true | string {
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(role)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    return result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : (result as true);
  }

  it.each([
    [Role.Employee, employee],
    [Role.Supervisor, supervisor],
  ])('opens the %s page for that role', (role, signedIn) => {
    account.set(signedIn);

    expect(runGuard(role)).toBe(true);
  });

  it('sends an employee from the supervisor page to their own overview', () => {
    account.set(employee);

    expect(runGuard(Role.Supervisor)).toBe('/employee/overview');
  });

  it('sends a supervisor from the employee page to their own overview', () => {
    account.set(supervisor);

    expect(runGuard(Role.Employee)).toBe('/supervisor/overview');
  });

  it.each([Role.Employee, Role.Supervisor])(
    'sends a signed-out user from the %s page to the account choice',
    (role) => {
      expect(runGuard(role)).toBe('/');
    },
  );
});
