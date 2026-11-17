import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { countCalendarDays, countWorkingDays } from '../utils';

export function workingDaysValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    if (!start || !end || countCalendarDays(start, end) < 1) {
      return null;
    }

    return countWorkingDays(start, end) > 0 ? null : { noWorkingDays: true };
  };
}
