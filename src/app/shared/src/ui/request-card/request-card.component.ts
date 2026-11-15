import { DatePipe } from '@angular/common';
import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular';
import { TimeOffRequest, TypeOffRequestStatus } from '@timeoff/shared';

@Component({
  selector: 'app-request-card',
  styleUrl: './request-card.component.scss',
  templateUrl: './request-card.component.html',
  imports: [
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonCardTitle,
    IonButton,
    DatePipe,
  ]
})
export class RequestCardComponent {
  public readonly timeOffRequest: InputSignal<TimeOffRequest> = input.required<TimeOffRequest>();
  public readonly isSupervisor: InputSignal<boolean> = input<boolean>(false);
  public readonly statusChanged: OutputEmitterRef<string> = output<string>();
  public readonly TypeOffRequestStatus: typeof TypeOffRequestStatus = TypeOffRequestStatus;

  public changeStatus(status: string): void {
    this.statusChanged.emit(status);
  }
}
