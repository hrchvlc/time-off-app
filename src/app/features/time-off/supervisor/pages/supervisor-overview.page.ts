import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { AlertController, IonContent, IonLabel, IonSegment, IonSegmentButton, IonSpinner, SegmentValue } from '@ionic/angular';
import { EmptyStateComponent, LocalStorageService, NotificationService, RequestCardComponent, TimeOffRequest, TypeOffRequestStatus } from '@timeoff/shared';

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
    IonSpinner,
    RequestCardComponent,
    EmptyStateComponent
  ]
})
export class SupervisorOverviewPage implements OnInit {
  private readonly alertController: AlertController = inject(AlertController);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly notificationService : NotificationService = inject(NotificationService);

  protected readonly activeTab: WritableSignal<Tab> = signal<Tab>('pending');
  protected readonly allRequests: WritableSignal<TimeOffRequest[]> = signal([]);
  protected readonly listLoading: WritableSignal<boolean> = signal(false);

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

  public async ngOnInit(): Promise<void> {
    this.listLoading.set(true);
    await this.loadAllRequests();
  }

  public changeActiveTab(value: SegmentValue | undefined): void {
    if (!value) {
      return;
    }
    this.activeTab.set(value as Tab);
  }

  public async onChangeRequestStatus(changedRequest: TimeOffRequest): Promise<void> {
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
      const res = await this.localStorageService.changeRequestStatus(changedRequest);
      if (res?.status === 'success') {
        this.notificationService.success('Status successfully updated.');
        await this.loadAllRequests();
      } else {
        this.notificationService.error('Error has occured. Try again later.');
      }
    }
  }

  private determineStatus(status: TypeOffRequestStatus): string {
    return status === TypeOffRequestStatus.Approved ?  status.toLowerCase().slice(0, -1) : status.toLowerCase().slice(0, -2);
  }

  private async loadAllRequests(): Promise<void> {
    const res = await this.localStorageService.loadSupervisorRequests();
    if (res) {
      this.allRequests.set(res);
      this.listLoading.set(false);
    }
  }
}
