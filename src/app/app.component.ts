import { LowerCasePipe } from '@angular/common';
import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonApp,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonRouterOutlet,
  IonToolbar,
} from '@ionic/angular';
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
    IonMenu,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonMenuToggle,
    LowerCasePipe,
    RouterLink,
  ],
})
export class AppComponent implements OnInit {
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly router: Router = inject(Router);
  public readonly demoAccounts: Signal<Account[]> = this.localStorageService.accounts.asReadonly();
  public readonly activeAccount: Signal<Account | undefined> = this.localStorageService.account.asReadonly();
  public readonly Role: typeof Role = Role;

  public async ngOnInit(): Promise<void> {
    await this.localStorageService.loadAccounts();
  }

  public chooseAccount(chosenAccount: Account): void {
    this.localStorageService.changeAccount(chosenAccount);
    this.router.navigate([`${chosenAccount.role}`.toLowerCase() + '/overview']);
  }
}
