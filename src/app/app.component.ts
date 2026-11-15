import { LowerCasePipe } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular';
import { Account, Role } from '@timeoff/shared';

const dummyAccounts: Account[] = [
  {
    id: "1234",
    name: "Dummy Employee",
    role: Role.Employee,
  },
  {
    id: "4321",
    name: "Dummy Supervisor",
    role: Role.Supervisor,

  }
];

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
    LowerCasePipe
  ],
})
export class AppComponent {
  public readonly router: Router = inject(Router);
  public readonly demoAccounts: WritableSignal<Account[]> = signal(dummyAccounts);
  public readonly Role: typeof Role = Role;

  public chooseAccount(chosenAccount: Role): void {
    this.router.navigate([`${chosenAccount}`.toLowerCase() + '/overview']);
  }

  public returnHome(): void {
    this.router.navigate(['/']);
  }
}
