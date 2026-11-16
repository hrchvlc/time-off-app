import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;

    if (!start || !end) {
      return null;
    }

    const startDay = new Date(start).setHours(0, 0, 0, 0);
    const endDay = new Date(end).setHours(0, 0, 0, 0);

    return endDay >= startDay ? null : { endBeforeStart: true };
  };
}
