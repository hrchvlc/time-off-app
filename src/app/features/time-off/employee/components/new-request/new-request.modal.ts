import { Component, inject, input, InputSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonText,
  IonTextarea,
  ModalController,
} from '@ionic/angular';
import { NewTimeOffRequest, TimeOffType } from '@timeoff/shared';

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
    IonTextarea
  ]
})
export class NewRequestModal {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly modalCtrl: ModalController = inject(ModalController);
  public readonly employeeId: InputSignal<number> = input.required<number>();
  public readonly form: FormGroup = this.initializeForm();
  public readonly timeOffTypes: TimeOffType[] = Object.values(TimeOffType);
  public readonly now: string = new Date().toISOString();

  public closeModal(): void {
    this.modalCtrl.dismiss();
  }

  public async createNewRequest(): Promise<void> {
    const request: NewTimeOffRequest = {
      ...this.form.getRawValue(),
      employeeId: this.employeeId(),
    };

    await this.modalCtrl.dismiss(request);
  }

  private initializeForm(): FormGroup {
    return this.formBuilder.group({
      startDate: [ null, Validators.required ],
      endDate: [ null, Validators.required ],
      type: [ null, Validators.required ],
      note: [ null ]
    });
  }
}
