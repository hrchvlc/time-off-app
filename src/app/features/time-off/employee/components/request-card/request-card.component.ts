import { DatePipe } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular';
import { TimeOffRequest } from '@timeoff/shared';

@Component({
  selector: 'app-request-card',
  styleUrl: './request-card.component.scss',
  templateUrl: './request-card.component.html',
  imports: [IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonCardTitle, DatePipe]
})
export class RequestCardComponent {
  public readonly timeOffRequest: InputSignal<TimeOffRequest> = input.required<TimeOffRequest>();
}
