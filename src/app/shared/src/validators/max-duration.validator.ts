import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

function toDayNumber(value: string): number {
  const [ year, month, day ] = value.slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function maxDurationValidator(startKey: string, endKey: string, maxDays: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    if (!start || !end) {
      return null;
    }

    const days = toDayNumber(end) - toDayNumber(start) + 1;

    if (days < 1) {
      return null;
    }
    return days <= maxDays ? null : { rangeTooLong: { max: maxDays, actual: days } };
  };
}
