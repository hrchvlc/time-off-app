import { FormControl, FormGroup } from '@angular/forms';
import { maxDurationValidator } from './max-duration.validator';

describe('maxDurationValidator', () => {
  const maxDays: number = 25;

  function createForm(startDate: string | null, endDate: string | null): FormGroup {
    return new FormGroup(
      {
        startDate: new FormControl(startDate),
        endDate: new FormControl(endDate),
      },
      { validators: maxDurationValidator('startDate', 'endDate', maxDays) },
    );
  }

  it('is valid for a range shorter than the maximum', () => {
    const form = createForm('2026-11-16T10:00:00', '2026-11-20T10:00:00');

    expect(form.hasError('rangeTooLong')).toBe(false);
  });

  it('is valid for a range of exactly the maximum, counting both ends', () => {
    const form = createForm('2026-11-01T10:00:00', '2026-11-25T10:00:00');

    expect(form.hasError('rangeTooLong')).toBe(false);
  });

  it('is invalid for a range one day longer than the maximum', () => {
    const form = createForm('2026-11-01T10:00:00', '2026-11-26T10:00:00');

    expect(form.hasError('rangeTooLong')).toBe(true);
    expect(form.getError('rangeTooLong')).toEqual({ max: maxDays, actual: 26 });
  });

  it('counts calendar days across a month boundary', () => {
    const form = createForm('2026-11-20T10:00:00', '2026-12-20T10:00:00');

    expect(form.getError('rangeTooLong')).toEqual({ max: maxDays, actual: 31 });
  });

  it('leaves an end date before the start date to dateRangeValidator', () => {
    const form = createForm('2026-11-20T10:00:00', '2026-11-16T10:00:00');

    expect(form.hasError('rangeTooLong')).toBe(false);
  });

  it('is valid while one of the dates is missing', () => {
    expect(createForm(null, '2026-11-16T10:00:00').hasError('rangeTooLong')).toBe(false);
    expect(createForm('2026-11-16T10:00:00', null).hasError('rangeTooLong')).toBe(false);
  });
});
