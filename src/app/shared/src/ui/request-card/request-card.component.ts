import { DatePipe } from '@angular/common';
import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular';
import { ChangeRequest, TimeOffRequest, TypeOffRequestStatus } from '../../models';

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
    IonBadge,
    DatePipe,
  ]
})
export class RequestCardComponent {
  public readonly timeOffRequest: InputSignal<TimeOffRequest> = input.required<TimeOffRequest>();
  public readonly isSupervisor: InputSignal<boolean> = input<boolean>(false);

  public readonly statusChanged: OutputEmitterRef<ChangeRequest> = output<ChangeRequest>();
  public readonly TypeOffRequestStatus: typeof TypeOffRequestStatus = TypeOffRequestStatus;

  public getBadgeVariant(status: TypeOffRequestStatus): string {
    switch (status) {
    case TypeOffRequestStatus.Approved:
      return 'primary';
    case TypeOffRequestStatus.Rejected:
    default:
      return 'tertiary';
    }

  }

  public changeStatus(status: TypeOffRequestStatus): void {
    const changedRequest: ChangeRequest = {
      id: this.timeOffRequest().id,
      status
    }
    this.statusChanged.emit(changedRequest);
  }
}
