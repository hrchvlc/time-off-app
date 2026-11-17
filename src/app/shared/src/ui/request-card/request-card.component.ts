import { DatePipe } from '@angular/common';
import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/angular';
import { TimeOffRequest, TimeOffRequestStatus } from '../../models';

@Component({
  selector: 'app-request-card',
  styleUrl: './request-card.component.scss',
  templateUrl: './request-card.component.html',
  imports: [IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonCardTitle, IonButton, IonBadge, DatePipe],
})
export class RequestCardComponent {
  public readonly timeOffRequest: InputSignal<TimeOffRequest> = input.required<TimeOffRequest>();
  public readonly isSupervisor: InputSignal<boolean> = input<boolean>(false);
  public readonly busy: InputSignal<boolean> = input<boolean>(false);

  public readonly statusChanged: OutputEmitterRef<TimeOffRequest> = output<TimeOffRequest>();
  public readonly TimeOffRequestStatus: typeof TimeOffRequestStatus = TimeOffRequestStatus;

  public getBadgeVariant(status: TimeOffRequestStatus): string {
    switch (status) {
      case TimeOffRequestStatus.Approved:
        return 'primary';
      case TimeOffRequestStatus.Pending:
        return 'secondary';
      case TimeOffRequestStatus.Rejected:
      default:
        return 'tertiary';
    }
  }

  public changeStatus(status: TimeOffRequestStatus): void {
    const changedRequest: TimeOffRequest = {
      ...this.timeOffRequest(),
      status,
    };
    this.statusChanged.emit(changedRequest);
  }
}
