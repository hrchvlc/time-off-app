import { DatePipe } from '@angular/common';
import { Component, inject, input, InputSignal } from '@angular/core';
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
  IonText,
  IonTextarea,
  ModalController,
} from '@ionic/angular';
import { dateRangeValidator, LocalStorageService, maxDurationValidator, TimeOffRequest, TimeOffType, TypeOffRequestStatus } from '@timeoff/shared';

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
    DatePipe
  ]
})
export class NewRequestModal {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly modalCtrl: ModalController = inject(ModalController);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  private readonly maxDuration: number = 25;
  public readonly employee: InputSignal<TimeOffRequest> = input.required<TimeOffRequest>();
  public readonly form: FormGroup = this.initializeForm();
  public readonly timeOffTypes: TimeOffType[] = Object.values(TimeOffType);
  public readonly now: string = new Date().toISOString();

  public get endMin(): string {
    return this.form.controls['startDate'].value ?? this.now;
  }

  public closeModal(): void {
    this.modalCtrl.dismiss();
  }

  public async createNewRequest(): Promise<void> {
    const employee = this.employee();
    const rawFormValue = this.form.getRawValue();
    const request: TimeOffRequest = {
      ...rawFormValue,
      startDate: this.formatDate(rawFormValue.startDate),
      endDate: this.formatDate(rawFormValue.endDate),
      employeeId: employee.employeeId,
      workingDays: this.countDays(rawFormValue.startDate, rawFormValue.endDate),
      createdAt: new Date().toISOString(),
      employeeFullName: employee.employeeFullName,
      id: Math.random() * 100,
      status: TypeOffRequestStatus.Pending,
      timeOffAllowance: employee.timeOffAllowance,
      timeOffSpent: employee.timeOffSpent,
    };

    const res = await this.localStorageService.addEmployeeRequest(request);
    if (res?.status === 'success') {
      await this.modalCtrl.dismiss('success');
    } else {
      await this.modalCtrl.dismiss('error');
    }
  }

  private formatDate(inputDate: string): string {
    const date = new Date(inputDate);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
  }

  private countDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff = end.getTime() - start.getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
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
        maxDurationValidator('startDate', 'endDate', this.maxDuration)
      ]
    }
    );
  }
}
