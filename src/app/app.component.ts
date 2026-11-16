import { LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonMenu, IonMenuButton, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular';
import { Account, dummyAccounts, Role } from '@timeoff/shared';

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
    IonMenuToggle,
    LowerCasePipe
  ],
})
export class AppComponent {
  private readonly router: Router = inject(Router);
  public readonly demoAccounts: Account[] = dummyAccounts;
  public readonly Role: typeof Role = Role;

  public chooseAccount(chosenAccount: Role): void {
    this.router.navigate([`${chosenAccount}`.toLowerCase() + '/overview']);
  }

  public returnHome(): void {
    this.router.navigate(['/']);
  }
}
