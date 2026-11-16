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
import { dateRangeValidator, maxDurationValidator, NewTimeOffRequest, TimeOffType } from '@timeoff/shared';

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
  // Could be changed according to employee allowance
  private readonly maxDuration: number = 25;
  public readonly employeeId: InputSignal<number> = input.required<number>();
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
    const rawFormValue = this.form.getRawValue();
    const request: NewTimeOffRequest = {
      ...rawFormValue,
      startDate: this.formatDate(rawFormValue.startDate),
      endDate: this.formatDate(rawFormValue.endDate),
      employeeId: this.employeeId(),
    };

    await this.modalCtrl.dismiss(request);
  }

  private formatDate(inputDate: string): string {
    const date = new Date(inputDate);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
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
