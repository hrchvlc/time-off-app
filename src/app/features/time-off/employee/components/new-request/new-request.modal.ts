import { DatePipe } from '@angular/common';
import { Component, inject, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonFooter,
  IonHeader,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  ModalController,
} from '@ionic/angular';
import {
  Account,
  allowanceValidator,
  countWorkingDays,
  dateRangeValidator,
  getLocalToday,
  LocalStorageService,
  maxDurationValidator,
  NotificationService,
  TimeOffRequest,
  TimeOffRequestStatus,
  TimeOffType,
  toCalendarDay,
  workingDaysValidator,
} from '@timeoff/shared';

interface NewRequestForm {
  endDate: FormControl<string | null>;
  note: FormControl<string>;
  startDate: FormControl<string | null>;
  type: FormControl<TimeOffType | null>;
}

@Component({
  selector: 'app-new-request',
  styleUrl: './new-request.modal.scss',
  templateUrl: './new-request.modal.html',
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonButton,
    IonContent,
    IonFooter,
    IonSelect,
    IonSelectOption,
    IonText,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonTextarea,
    IonSpinner,
    DatePipe,
  ],
})
export class NewRequestModal {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly modalCtrl: ModalController = inject(ModalController);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly notificationService: NotificationService = inject(NotificationService);
  private readonly account: WritableSignal<Account | undefined> = this.localStorageService.account;

  private readonly maxDuration: number = 25;
  public readonly daysLeft: InputSignal<number | undefined> = input<number | undefined>(undefined);
  public readonly form: FormGroup<NewRequestForm> = this.initializeForm();
  public readonly timeOffTypes: TimeOffType[] = Object.values(TimeOffType);
  public readonly today: string = getLocalToday();
  public readonly isSubmitting: WritableSignal<boolean> = signal(false);

  public get endMin(): string {
    return this.form.controls.startDate.value ?? this.today;
  }

  public closeModal(): void {
    this.modalCtrl.dismiss();
  }

  public async createNewRequest(): Promise<void> {
    const account = this.account();
    const { startDate, endDate, type, note } = this.form.getRawValue();
    if (!account || !startDate || !endDate || !type || this.isSubmitting()) {
      return;
    }
    const request: TimeOffRequest = {
      startDate: toCalendarDay(startDate),
      endDate: toCalendarDay(endDate),
      type,
      note: note.trim() || undefined,
      employeeId: account.id,
      employeeFullName: account.name,
      workingDays: countWorkingDays(startDate, endDate),
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      status: TimeOffRequestStatus.Pending,
    };

    this.isSubmitting.set(true);
    try {
      const res = await this.localStorageService.addEmployeeRequest(request);
      if (res.status === 'success') {
        await this.modalCtrl.dismiss('success');
      } else {
        this.notificationService.error('Error has occurred. Try again later.');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private initializeForm(): FormGroup<NewRequestForm> {
    return this.formBuilder.group<NewRequestForm>(
      {
        startDate: this.formBuilder.control<string | null>(null, Validators.required),
        endDate: this.formBuilder.control<string | null>(null, Validators.required),
        type: this.formBuilder.control<TimeOffType | null>(null, Validators.required),
        note: this.formBuilder.nonNullable.control('', Validators.maxLength(300)),
      },
      {
        validators: [
          dateRangeValidator('startDate', 'endDate'),
          workingDaysValidator('startDate', 'endDate'),
          maxDurationValidator('startDate', 'endDate', this.maxDuration),
          allowanceValidator('startDate', 'endDate', () => this.daysLeft()),
        ],
      },
    );
  }
}
