import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { IonButton, IonContent, IonFooter, IonLabel, IonSegment, IonSegmentButton, IonSpinner, ModalController, SegmentValue } from '@ionic/angular';
import { EmptyStateComponent, LocalStorageService, NotificationService, RequestCardComponent, TimeOffRequest } from '@timeoff/shared';
import { NewRequestModal } from '../components';

type Tab = 'upcoming' | 'past';

@Component({
  selector: 'app-employee-overview',
  templateUrl: './employee-overview.page.html',
  styleUrls: ['./employee-overview.page.scss'],
  imports: [
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonFooter,
    IonButton,
    IonSpinner,
    RequestCardComponent,
    EmptyStateComponent,
  ]
})
export class EmployeeOverviewPage implements OnInit {
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly modalController: ModalController = inject(ModalController);
  private readonly notificationService : NotificationService = inject(NotificationService);
  private readonly today: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  protected readonly activeTab: WritableSignal<Tab> = signal<Tab>('upcoming');
  protected readonly allRequests: WritableSignal<TimeOffRequest[]> = signal([]);
  protected readonly listLoading: WritableSignal<boolean> = signal(false);

  protected readonly upcomingRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((r) => r.endDate >= this.today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
  );

  protected readonly pastRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((r) => r.endDate < this.today)
      .sort((a, b) => b.endDate.localeCompare(a.endDate)),
  );

  protected readonly showNewRequestButton: Signal<boolean> = computed(
    () =>  {
      if (this.activeTab() !== 'upcoming') {
        return false;
      }
      const hasNoRequests = this.upcomingRequests().length === 0;
      const firstRequest = this.upcomingRequests()[0];
      const hasAllowance = !!firstRequest && firstRequest.timeOffSpent < firstRequest.timeOffAllowance;

      return hasNoRequests || hasAllowance;
    });

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

  protected async createNewRequest(): Promise<void> {
    const newRequestModal = await this.modalController.create({
      component: NewRequestModal,
      componentProps: {
        employee: this.allRequests()[0],
      },
    });
    await newRequestModal.present();
    const { data } = await newRequestModal.onWillDismiss();
    if (data) {
      if (data === 'success') {
        await this.loadAllRequests();
        this.notificationService.success('Request successfully submitted.');
      } else {
        this.notificationService.error('Error has occured. Try again later.');
      }
    }
  }

  private async loadAllRequests(): Promise<void> {
    const res = await this.localStorageService.loadEmployeeRequests();
    if (res) {
      this.allRequests.set(res);
      this.listLoading.set(false);
    }
  }
}
