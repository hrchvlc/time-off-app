import { Component, computed, effect, inject, Signal, signal, untracked, WritableSignal } from '@angular/core';
import {
  AlertController,
  IonContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  SegmentValue,
} from '@ionic/angular';
import {
  EmptyStateComponent,
  LocalStorageService,
  NotificationService,
  RequestCardComponent,
  Role,
  TimeOffRequest,
  TimeOffRequestDecision,
  TimeOffRequestStatus,
} from '@timeoff/shared';

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
    IonSkeletonText,
    RequestCardComponent,
    EmptyStateComponent,
  ],
})
export class SupervisorOverviewPage {
  private readonly alertController: AlertController = inject(AlertController);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly notificationService: NotificationService = inject(NotificationService);

  protected readonly activeTab: WritableSignal<Tab> = signal<Tab>('pending');
  protected readonly allRequests: Signal<TimeOffRequest[]> = this.localStorageService.allRequests;
  protected readonly listLoading: WritableSignal<boolean> = signal(false);
  protected readonly savingRequestId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  protected readonly pendingRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((r) => r.status === TimeOffRequestStatus.Pending)
      .sort((a, b) => b.endDate.localeCompare(a.endDate)),
  );

  protected readonly pastRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((r) => r.status !== TimeOffRequestStatus.Pending)
      .sort((a, b) => b.endDate.localeCompare(a.endDate)),
  );

  constructor() {
    effect(() => {
      if (this.localStorageService.account()?.role !== Role.Supervisor) {
        return;
      }
      untracked(() => {
        this.listLoading.set(true);
        this.loadAllRequests();
      });
    });
  }

  public changeActiveTab(value: SegmentValue | undefined): void {
    if (!value) {
      return;
    }
    this.activeTab.set(value as Tab);
  }

  public async onChangeRequestStatus(changedRequest: TimeOffRequest): Promise<void> {
    const supervisor = this.localStorageService.account();
    if (!supervisor) {
      return;
    }
    const status = this.determineStatus(changedRequest.status);
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: `Are you sure you want to ${status} this request?`,
      inputs: [
        {
          name: 'decisionNote',
          type: 'textarea',
          placeholder: 'Add a note (optional)',
          attributes: { maxlength: 126, 'aria-label': 'Note' },
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: `${status}`, role: 'confirm' },
      ],
    });

    await alert.present();

    const { data, role } = await alert.onDidDismiss();
    if (role !== 'confirm') {
      return;
    }
    this.savingRequestId.set(changedRequest.id);

    try {
      const decision: TimeOffRequestDecision = {
        requestId: changedRequest.id,
        status: changedRequest.status,
        decidedByFullName: supervisor.name,
        decisionNote: data?.values?.decisionNote?.trim() || undefined,
      };
      const res = await this.localStorageService.changeRequestStatus(decision);
      if (res.status === 'success') {
        this.notificationService.success('Status successfully updated.');
      } else {
        this.notificationService.error('Error has occurred. Try again later.');
      }
    } finally {
      this.savingRequestId.set(undefined);
    }
  }

  private determineStatus(status: TimeOffRequestStatus): string {
    return status === TimeOffRequestStatus.Approved
      ? status.toLowerCase().slice(0, -1)
      : status.toLowerCase().slice(0, -2);
  }

  private async loadAllRequests(): Promise<void> {
    try {
      await this.localStorageService.loadSupervisorRequests();
    } finally {
      this.listLoading.set(false);
    }
  }
}
