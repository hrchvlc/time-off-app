import { DatePipe } from '@angular/common';
import { Component, inject, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonBadge,
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
  TimeOffRequest,
  TimeOffType,
  toCalendarDay,
  TypeOffRequestStatus,
} from '@timeoff/shared';

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
    IonBadge,
    IonSpinner,
    DatePipe
  ]
})
export class NewRequestModal {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly modalCtrl: ModalController = inject(ModalController);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly account: WritableSignal<Account | undefined> = this.localStorageService.account;

  private readonly maxDuration: number = 25;
  public readonly daysLeft: InputSignal<number | undefined> = input<number | undefined>(undefined);
  public readonly form: FormGroup = this.initializeForm();
  public readonly timeOffTypes: TimeOffType[] = Object.values(TimeOffType);
  public readonly today: string = getLocalToday();
  public readonly isSubmitting: WritableSignal<boolean> = signal(false);

  public get endMin(): string {
    return this.form.controls['startDate'].value ?? this.today;
  }

  public closeModal(): void {
    this.modalCtrl.dismiss();
  }

  public async createNewRequest(): Promise<void> {
    const account = this.account();
    if (!account || this.isSubmitting()) {
      return;
    }
    const rawFormValue = this.form.getRawValue();
    const request: TimeOffRequest = {
      ...rawFormValue,
      startDate: toCalendarDay(rawFormValue.startDate),
      endDate: toCalendarDay(rawFormValue.endDate),
      employeeId: account.id,
      employeeFullName: account.name,
      timeOffAllowance: account.timeOffAllowance ?? 0,
      timeOffSpent: account.timeOffSpent ?? 0,
      workingDays: countWorkingDays(rawFormValue.startDate, rawFormValue.endDate),
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      status: TypeOffRequestStatus.Pending,
    };

    this.isSubmitting.set(true);
    try {
      const res = await this.localStorageService.addEmployeeRequest(request);
      if (res?.status === 'success') {
        await this.modalCtrl.dismiss('success');
      } else {
        await this.modalCtrl.dismiss('error');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private initializeForm(): FormGroup {
    return this.formBuilder.group({
      startDate: [ null, Validators.required ],
      endDate: [ null, Validators.required ],
      type: [ null, Validators.required ],
      note: [ null, Validators.maxLength(300)  ]
    },
    {
      validators: [
        dateRangeValidator('startDate', 'endDate'),
        maxDurationValidator('startDate', 'endDate', this.maxDuration),
        allowanceValidator('startDate', 'endDate', () => this.daysLeft()),
      ]
    }
    );
  }
}
