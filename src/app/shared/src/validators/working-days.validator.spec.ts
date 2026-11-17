import { FormControl, FormGroup } from '@angular/forms';
import { workingDaysValidator } from './working-days.validator';

describe('workingDaysValidator', () => {
  function createForm(startDate: string | null, endDate: string | null): FormGroup {
    return new FormGroup(
      {
        startDate: new FormControl(startDate),
        endDate: new FormControl(endDate),
      },
      { validators: workingDaysValidator('startDate', 'endDate') },
    );
  }

  // 21 and 22 Nov 2026 are a Saturday and a Sunday.
  it.each([
    ['a whole weekend', '2026-11-21T10:00:00', '2026-11-22T10:00:00'],
    ['a single Saturday', '2026-11-21T10:00:00', '2026-11-21T10:00:00'],
    ['a single Sunday', '2026-11-22T10:00:00', '2026-11-22T10:00:00'],
  ])('is invalid for %s', (_, startDate, endDate) => {
    expect(createForm(startDate, endDate).hasError('noWorkingDays')).toBe(true);
  });

  it.each([
    ['a single weekday', '2026-11-20T10:00:00', '2026-11-20T10:00:00'],
    ['a range from Saturday to Monday', '2026-11-21T10:00:00', '2026-11-23T10:00:00'],
  ])('is valid for %s', (_, startDate, endDate) => {
    expect(createForm(startDate, endDate).hasError('noWorkingDays')).toBe(false);
  });

  it('leaves an end date before the start date to the date range check', () => {
    expect(createForm('2026-11-22T10:00:00', '2026-11-21T10:00:00').hasError('noWorkingDays')).toBe(false);
  });

  it('is valid while one of the dates is missing', () => {
    expect(createForm(null, '2026-11-21T10:00:00').hasError('noWorkingDays')).toBe(false);
    expect(createForm('2026-11-21T10:00:00', null).hasError('noWorkingDays')).toBe(false);
  });
});
