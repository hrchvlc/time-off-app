import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { AlertController, IonContent, IonLabel, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, SegmentValue } from '@ionic/angular';
import { ChangeRequest, EmptyStateComponent, RequestCardComponent, TimeOffRequest, TypeOffRequestStatus } from '@timeoff/shared';
import { mockTimeOffSupervisorRequests } from './mock-supervisor-data.const';

type Tab = 'pending' | 'past';

@Component({
  selector: 'app-supervisor-overview',
  templateUrl: './supervisor-overview.page.html',
  styleUrls: ['./supervisor-overview.page.scss'],
  imports: [
    IonContent,
    IonSegmentButton,
    IonSegment,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    RequestCardComponent,
    EmptyStateComponent
  ]
})
export class SupervisorOverviewPage {
  private readonly alertController: AlertController = inject(AlertController);

  protected readonly activeTab: WritableSignal<Tab> = signal<Tab>('pending');
  protected readonly allRequests: WritableSignal<TimeOffRequest[]> = signal(mockTimeOffSupervisorRequests);

  protected readonly pendingRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((r) => r.status === TypeOffRequestStatus.Pending)
      .sort((a, b) => b.endDate.localeCompare(a.endDate)),
  );

  protected readonly pastRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((r) => r.status !== TypeOffRequestStatus.Pending)
      .sort((a, b) => b.endDate.localeCompare(a.endDate)),
  );

  public readonly TypeOffRequestStatus: typeof TypeOffRequestStatus = TypeOffRequestStatus;

  public changeActiveTab(value: SegmentValue | undefined): void {
    if (!value) {
      return;
    }
    this.activeTab.set(value as Tab);
  }

  public async onChangeRequestStatus(changedRequest: ChangeRequest): Promise<void> {
    const status = this.determineStatus(changedRequest.status);
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: `Are you sure you want to ${status} this request?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: `${status}`, role: 'confirm' },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'cancel') {
      return;
    }
    if (role === 'confirm') {
    // change status
      // const changeRequest = changedRequest;

    }
  }

  private determineStatus(status: TypeOffRequestStatus): string {
    return status === TypeOffRequestStatus.Approved ?  status.toLowerCase().slice(0, -1) : status.toLowerCase().slice(0, -2);
  }
}
