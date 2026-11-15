import { Component } from '@angular/core';
import { IonApp, IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
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
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {}
