import { LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';
import { Account, dummyAccounts, Role } from '@timeoff/shared';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonButton, LowerCasePipe]
})
export class HomePage {
  private readonly router: Router = inject(Router);
  public readonly demoAccounts: Account[] = dummyAccounts;
  public readonly Role: typeof Role = Role;

  public chooseAccount(chosenAccount: Role): void {
    this.router.navigate([`${chosenAccount}`.toLowerCase() + '/overview']);
  }
}
