import { LowerCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonMenu, IonMenuButton, IonMenuToggle, IonRouterOutlet, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { Account, LocalStorageService, Role } from '@timeoff/shared';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet,
    IonHeader,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonMenu,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonSpinner,
    IonMenuToggle,
    LowerCasePipe
  ],
})
export class AppComponent implements OnInit {
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly router: Router = inject(Router);
  public readonly demoAccounts: WritableSignal<Account[] | undefined> = signal(undefined);
  public readonly isLoading: WritableSignal<boolean> = signal(false);
  public readonly Role: typeof Role = Role;

  public async ngOnInit(): Promise<void> {
    await this.loadAllAccount();
  }

  public chooseAccount(chosenAccount: Role): void {
    this.router.navigate([`${chosenAccount}`.toLowerCase() + '/overview']);
  }

  public returnHome(): void {
    this.router.navigate(['/']);
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
