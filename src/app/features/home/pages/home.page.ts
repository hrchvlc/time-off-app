import { LowerCasePipe } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner, ViewWillEnter } from '@ionic/angular';
import { Account, LocalStorageService, Role } from '@timeoff/shared';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, LowerCasePipe, IonSpinner],
})
export class HomePage implements ViewWillEnter {
  private readonly router: Router = inject(Router);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  public readonly demoAccounts: Signal<Account[]> = this.localStorageService.accounts.asReadonly();
  public readonly isLoading: Signal<boolean> = this.localStorageService.isLoading;
  public readonly Role: typeof Role = Role;

  public ionViewWillEnter(): void {
    this.localStorageService.clearAccount();
  }

  public chooseAccount(chosenAccount: Account): void {
    this.localStorageService.changeAccount(chosenAccount);
    this.router.navigate([`${chosenAccount.role}`.toLowerCase() + '/overview']);
  }
}
