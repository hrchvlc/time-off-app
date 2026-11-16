import { LowerCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonSpinner } from '@ionic/angular';
import { Account, LocalStorageService, Role } from '@timeoff/shared';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonButton, LowerCasePipe, IonSpinner]
})
export class HomePage implements OnInit {
  private readonly router: Router = inject(Router);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  public readonly demoAccounts: WritableSignal<Account[] | undefined> = signal(undefined);
  public readonly isLoading: WritableSignal<boolean> = signal(false);
  public readonly Role: typeof Role = Role;

  public chooseAccount(chosenAccount: Role): void {
    this.router.navigate([`${chosenAccount}`.toLowerCase() + '/overview']);
  }

  public async ngOnInit(): Promise<void> {
    await this.loadAllAccount();
  }

  private async loadAllAccount(): Promise<void> {
    this.isLoading.set(true);
    const res = await this.localStorageService.loadAccounts();
    if (res) {
      this.demoAccounts.set(res);
      this.isLoading.set(false);
    }
  }
}
