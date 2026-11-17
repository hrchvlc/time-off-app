import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { countWorkingDays } from '../utils';

/**
 * Stops a request that needs more working days than are left.
 * Days left are read on every check, so the value can arrive after the form is created.
 * Without a value (no allowance known) nothing is checked.
 */
export function allowanceValidator(
  startKey: string,
  endKey: string,
  getDaysLeft: () => number | undefined,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    const daysLeft = getDaysLeft();
    if (!start || !end || daysLeft === undefined) {
      return null;
    }

    const requested = countWorkingDays(start, end);
    return requested <= daysLeft ? null : { notEnoughDays: { left: daysLeft, requested } };
  };
}
