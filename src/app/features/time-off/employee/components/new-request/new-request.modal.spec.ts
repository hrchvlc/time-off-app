import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController, provideIonicAngular } from '@ionic/angular';
import {
  Account,
  ApiResponse,
  dummyAccounts,
  LocalStorageService,
  NotificationService,
  TimeOffRequest,
  TimeOffRequestStatus,
  TimeOffType,
} from '@timeoff/shared';
import { NewRequestModal } from './new-request.modal';

describe('NewRequestModal', () => {
  const employeeAccount: Account = dummyAccounts[0];
  const successResponse: ApiResponse = { status: 'success', error: '' };

  let fixture: ComponentFixture<NewRequestModal>;
  let component: NewRequestModal;
  let account: WritableSignal<Account | undefined>;
  let addEmployeeRequest: ReturnType<typeof vi.fn<(request: TimeOffRequest) => Promise<ApiResponse>>>;
  let dismissModal: ReturnType<typeof vi.fn<(data?: unknown) => Promise<boolean>>>;
  let showError: ReturnType<typeof vi.fn<(message: string) => Promise<void>>>;

  beforeEach(async () => {
    account = signal<Account | undefined>(employeeAccount);
    showError = vi.fn<(message: string) => Promise<void>>().mockResolvedValue(undefined);
    addEmployeeRequest = vi.fn<(request: TimeOffRequest) => Promise<ApiResponse>>().mockResolvedValue(successResponse);
    dismissModal = vi.fn<(data?: unknown) => Promise<boolean>>().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [NewRequestModal],
      providers: [
        provideIonicAngular({ useSetInputAPI: true }),
        { provide: LocalStorageService, useValue: { account, addEmployeeRequest } },
        { provide: ModalController, useValue: { dismiss: dismissModal } },
        { provide: NotificationService, useValue: { error: showError } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewRequestModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** Fills the form the way the date picker does: local date and time, no timezone. */
  function fillValidForm(): void {
    component.form.setValue({
      startDate: '2026-11-20T14:23:00',
      endDate: '2026-11-23T14:23:00',
      type: TimeOffType.Vacation,
      note: 'Long weekend',
    });
  }

  /**
   * Ionic does not update the `disabled` attribute in jsdom,
   * so tests check the property that Angular's [disabled] binding sets.
   */
  function isSendButtonDisabled(): boolean {
    const sendButton: HTMLIonButtonElement = fixture.nativeElement.querySelector('ion-footer ion-button');
    return sendButton.disabled;
  }

  it('creates the modal with an empty, invalid form', () => {
    expect(component).toBeTruthy();
    expect(component.form.valid).toBe(false);
  });

  it('builds the request from the account and form values', async () => {
    fillValidForm();

    await component.createNewRequest();

    expect(addEmployeeRequest).toHaveBeenCalledTimes(1);
    const savedRequest = addEmployeeRequest.mock.calls[0][0];
    expect(savedRequest).toEqual(
      expect.objectContaining({
        employeeId: employeeAccount.id,
        employeeFullName: employeeAccount.name,
        startDate: '2026-11-20',
        endDate: '2026-11-23',
        workingDays: 2,
        type: TimeOffType.Vacation,
        note: 'Long weekend',
        status: TimeOffRequestStatus.Pending,
      }),
    );
    expect(typeof savedRequest.id).toBe('string');
  });

  it.each(['', '   '])('saves no note when it is left empty (note: "%s")', async (note) => {
    fillValidForm();
    component.form.controls.note.setValue(note);

    await component.createNewRequest();

    const savedRequest = addEmployeeRequest.mock.calls[0][0];
    expect(savedRequest.note).toBeUndefined();
    expect(savedRequest).not.toHaveProperty('note', null);
  });

  it('saves the note without surrounding spaces', async () => {
    fillValidForm();
    component.form.controls.note.setValue('  Long weekend  ');

    await component.createNewRequest();

    expect(addEmployeeRequest.mock.calls[0][0].note).toBe('Long weekend');
  });

  it('gives every request a different id', async () => {
    fillValidForm();

    await component.createNewRequest();
    await component.createNewRequest();

    const [firstRequest, secondRequest] = addEmployeeRequest.mock.calls.map(([request]) => request);
    expect(firstRequest.id).not.toBe(secondRequest.id);
  });

  it('closes with "success" when the request is saved', async () => {
    fillValidForm();

    await component.createNewRequest();

    expect(dismissModal).toHaveBeenCalledWith('success');
  });

  it('shows an error and stays open with the form kept when saving fails, so it can be sent again', async () => {
    addEmployeeRequest.mockResolvedValue({ status: 'error', error: 'Requests could not be saved.' });
    fillValidForm();

    await component.createNewRequest();
    fixture.detectChanges();

    expect(showError).toHaveBeenCalledTimes(1);
    expect(dismissModal).not.toHaveBeenCalled();
    expect(component.form.valid).toBe(true);
    expect(isSendButtonDisabled()).toBe(false);
  });

  it('does nothing when no account is chosen', async () => {
    account.set(undefined);
    fillValidForm();

    await component.createNewRequest();

    expect(addEmployeeRequest).not.toHaveBeenCalled();
    expect(dismissModal).not.toHaveBeenCalled();
  });

  describe('submitting', () => {
    let finishSaving: (response: ApiResponse) => void;

    beforeEach(() => {
      addEmployeeRequest.mockReturnValue(new Promise<ApiResponse>((resolve) => (finishSaving = resolve)));
      fillValidForm();
    });

    it('saves only once when "Send request" is tapped twice', async () => {
      const firstTap = component.createNewRequest();
      const secondTap = component.createNewRequest();
      finishSaving(successResponse);
      await Promise.all([firstTap, secondTap]);

      expect(addEmployeeRequest).toHaveBeenCalledTimes(1);
      expect(dismissModal).toHaveBeenCalledTimes(1);
    });

    it('disables "Send request" while saving', async () => {
      fixture.detectChanges();
      expect(isSendButtonDisabled()).toBe(false);

      const pendingSave = component.createNewRequest();
      fixture.detectChanges();
      expect(component.isSubmitting()).toBe(true);
      expect(isSendButtonDisabled()).toBe(true);

      finishSaving(successResponse);
      await pendingSave;
      expect(component.isSubmitting()).toBe(false);
    });
  });

  it('blocks a weekend-only request and says why', () => {
    fillValidForm();
    // 21 and 22 Nov 2026 are a Saturday and a Sunday.
    component.form.patchValue({ startDate: '2026-11-21T14:23:00', endDate: '2026-11-22T14:23:00' });
    fixture.detectChanges();

    expect(isSendButtonDisabled()).toBe(true);
    expect(fixture.nativeElement.querySelector('.form-error')?.textContent).toContain('fall on a weekend');
  });

  it('keeps an empty alert region in place before any error, so screen readers announce errors when they appear', () => {
    const errorRegion: HTMLElement = fixture.nativeElement.querySelector('.form-error');

    expect(errorRegion.getAttribute('role')).toBe('alert');
    expect(errorRegion.textContent?.trim()).toBe('');
    expect(errorRegion.closest('.container')).not.toBeNull();
  });

  it('disables "Send request" while the form is invalid', () => {
    fixture.detectChanges();

    expect(isSendButtonDisabled()).toBe(true);
  });

  describe('days left', () => {
    function errorMessage(): string | undefined {
      return fixture.nativeElement.querySelector('.form-error')?.textContent?.trim();
    }

    // fillValidForm asks for 2 working days.
    it('blocks a request that needs more days than are left', () => {
      fixture.componentRef.setInput('daysLeft', 1);
      fillValidForm();
      fixture.detectChanges();

      expect(component.form.valid).toBe(false);
      expect(isSendButtonDisabled()).toBe(true);
      expect(errorMessage()).toContain('You have only 1 day off left');
    });

    it.each([TimeOffType.Sick, TimeOffType.Personal])('limits %s days the same way', (type) => {
      fixture.componentRef.setInput('daysLeft', 1);
      fillValidForm();
      component.form.controls.type.setValue(type);

      expect(component.form.hasError('notEnoughDays')).toBe(true);
    });

    it('allows a request that fits into the days left', () => {
      fixture.componentRef.setInput('daysLeft', 2);
      fillValidForm();

      expect(component.form.valid).toBe(true);
    });
  });
});
