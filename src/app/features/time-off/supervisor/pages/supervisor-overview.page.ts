import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { AlertController, IonContent, IonLabel, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, SegmentValue } from '@ionic/angular';
import { RequestCardComponent, TimeOffRequest, TypeOffRequestStatus } from '@timeoff/shared';
import { mockTimeOffRequests } from './mock-data.const';

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
  ]
})
export class SupervisorOverviewPage {
  private readonly alertController: AlertController = inject(AlertController);

  protected readonly activeTab: WritableSignal<Tab> = signal<Tab>('pending');
  protected readonly allRequests: WritableSignal<TimeOffRequest[]> = signal(mockTimeOffRequests);

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

  public changeActiveTab(value: SegmentValue | undefined): void {
    if (!value) {
      return;
    }
    this.activeTab.set(value as Tab);
  }

  public async onChangeRequestStatus(status: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: `Are you sure you want to ${status.toLowerCase()} this request?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: `${status}`, role: 'confirm', cssClass: 'danger' },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
    // change status
    }
  }
}
