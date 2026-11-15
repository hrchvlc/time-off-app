import { LowerCasePipe } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';
import { Account, Role } from '../../../shared/src/models';

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
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonButton, LowerCasePipe]
})
export class HomePage {
  public readonly router: Router = inject(Router);
  public readonly demoAccounts: WritableSignal<Account[]> = signal(dummyAccounts);

  public chooseAccount(chosenAccount: Role): void {
    this.router.navigate([`${chosenAccount}`.toLowerCase() + '/overview']);
  }
}
