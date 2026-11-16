import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { IonButton, IonContent, IonFooter, IonLabel, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, ModalController, SegmentValue } from '@ionic/angular';
import { EmptyStateComponent, NotificationService, RequestCardComponent, TimeOffRequest } from '@timeoff/shared';
import { NewRequestModal } from '../components';
import { mockTimeOffEmployeeRequests } from './mock-employee-data.const';

type Tab = 'upcoming' | 'past';

@Component({
  selector: 'app-employee-overview',
  templateUrl: './employee-overview.page.html',
  styleUrls: ['./employee-overview.page.scss'],
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonFooter,
    IonButton,
    RequestCardComponent,
    EmptyStateComponent,
  ]
})
export class EmployeeOverviewPage {
  private readonly modalController: ModalController = inject(ModalController);
  private readonly notificationService : NotificationService = inject(NotificationService);
  private readonly today: string = new Date().toISOString();

  protected readonly activeTab: WritableSignal<Tab> = signal<Tab>('upcoming');
  protected readonly allRequests: WritableSignal<TimeOffRequest[]> = signal(mockTimeOffEmployeeRequests);

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
        employeeId: this.allRequests()[0].employeeId,
      },
    });
    await newRequestModal.present();
    const { data } = await newRequestModal.onWillDismiss();
    if (data) {
      this.notificationService.success('Request successfully submitted.');
    }

    // Place for request

    // if (data?.status === 'created') {
    //   this.notificationService.success('Request successfully submitted.');
    // } else if (data?.status === 'failed') {
    //   this.notificationService.success('Request not submitted.');
    // } else {
    //   this.notificationService.success('Error has occured. Try again later.');
    // }
  }
}
