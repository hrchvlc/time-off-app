import { Component, computed, effect, inject, signal, Signal, untracked, WritableSignal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  ModalController,
  SegmentValue,
} from '@ionic/angular';
import {
  Account,
  AllowanceSummary,
  AllowanceSummaryComponent,
  EmptyStateComponent,
  getLocalToday,
  LocalStorageService,
  NotificationService,
  RequestCardComponent,
  Role,
  summarizeAllowance,
  TimeOffRequest,
  toCalendarDay,
} from '@timeoff/shared';
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
    IonSkeletonText,
    RequestCardComponent,
    EmptyStateComponent,
    AllowanceSummaryComponent,
  ],
})
export class EmployeeOverviewPage {
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly modalController: ModalController = inject(ModalController);
  private readonly notificationService: NotificationService = inject(NotificationService);
  private readonly today: WritableSignal<string> = signal(getLocalToday());
  private readonly account: WritableSignal<Account | undefined> = this.localStorageService.account;

  protected readonly activeTab: WritableSignal<Tab> = signal<Tab>('upcoming');
  protected readonly allRequests: Signal<TimeOffRequest[]> = this.localStorageService.allRequests;
  protected readonly listLoading: WritableSignal<boolean> = signal(false);

  protected readonly upcomingRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((request) => toCalendarDay(request.endDate) >= this.today())
      .sort((firstRequest, secondRequest) => firstRequest.startDate.localeCompare(secondRequest.startDate)),
  );

  protected readonly pastRequests: Signal<TimeOffRequest[]> = computed(() =>
    this.allRequests()
      .filter((request) => toCalendarDay(request.endDate) < this.today())
      .sort((firstRequest, secondRequest) => secondRequest.endDate.localeCompare(firstRequest.endDate)),
  );

  protected readonly allowanceSummary: Signal<AllowanceSummary | undefined> = computed(() => {
    const allowance = this.account()?.timeOffAllowance;
    return allowance ? summarizeAllowance(this.allRequests(), allowance) : undefined;
  });

  protected readonly showNewRequestButton: Signal<boolean> = computed(
    () => this.activeTab() === 'upcoming' && !this.listLoading(),
  );

  protected readonly canRequestTimeOff: Signal<boolean> = computed(() => {
    const summary = this.allowanceSummary();
    return !summary || summary.left > 0;
  });

  constructor() {
    effect(() => {
      if (this.account()?.role !== Role.Employee) {
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

  protected async createNewRequest(): Promise<void> {
    const newRequestModal = await this.modalController.create({
      component: NewRequestModal,
      componentProps: { daysLeft: this.allowanceSummary()?.left },
    });
    await newRequestModal.present();
    const { data } = await newRequestModal.onWillDismiss();

    if (data === 'success') {
      this.notificationService.success('Request successfully submitted.');
    }
  }

  private async loadAllRequests(): Promise<void> {
    this.today.set(getLocalToday());
    try {
      await this.localStorageService.loadEmployeeRequests();
    } finally {
      this.listLoading.set(false);
    }
  }
}
