import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { countCalendarDays } from '../utils';

export function maxDurationValidator(startKey: string, endKey: string, maxDays: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    if (!start || !end) {
      return null;
    }

    const days = countCalendarDays(start, end);

    if (days < 1) {
      return null;
    }
    return days <= maxDays ? null : { rangeTooLong: { max: maxDays, actual: days } };
  };
}
