import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator } from './date-range.validator';

describe('dateRangeValidator', () => {
  function createForm(startDate: string | null, endDate: string | null): FormGroup {
    return new FormGroup(
      {
        startDate: new FormControl(startDate),
        endDate: new FormControl(endDate),
      },
      { validators: dateRangeValidator('startDate', 'endDate') },
    );
  }

  it('is valid when the end date is after the start date', () => {
    const form = createForm('2026-11-16T10:00:00', '2026-11-20T10:00:00');

    expect(form.hasError('endBeforeStart')).toBe(false);
  });

  it('is valid when start and end are the same day, even if the end time is earlier', () => {
    const form = createForm('2026-11-16T18:00:00', '2026-11-16T08:00:00');

    expect(form.hasError('endBeforeStart')).toBe(false);
  });

  it('is invalid when the end date is before the start date', () => {
    const form = createForm('2026-11-20T10:00:00', '2026-11-16T10:00:00');

    expect(form.hasError('endBeforeStart')).toBe(true);
  });

  it('compares calendar days when one date has no time part', () => {
    const form = createForm('2026-11-20', '2026-11-19T10:00:00');

    expect(form.hasError('endBeforeStart')).toBe(true);
  });

  it('is valid while one of the dates is missing', () => {
    expect(createForm(null, '2026-11-16T10:00:00').hasError('endBeforeStart')).toBe(false);
    expect(createForm('2026-11-16T10:00:00', null).hasError('endBeforeStart')).toBe(false);
  });

  it('re-validates when a date changes', () => {
    const form = createForm('2026-11-16T10:00:00', '2026-11-20T10:00:00');

    form.controls['endDate'].setValue('2026-11-10T10:00:00');

    expect(form.hasError('endBeforeStart')).toBe(true);
  });
});
