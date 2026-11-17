import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Role } from '../models';
import { LocalStorageService } from '../services';

export function roleGuard(role: Role): CanActivateFn {
  return (): boolean | UrlTree => {
    const account = inject(LocalStorageService).account();
    const router = inject(Router);

    if (!account) {
      return router.createUrlTree(['/']);
    }
    return account.role === role || router.createUrlTree([`/${account.role.toLowerCase()}/overview`]);
  };
}
