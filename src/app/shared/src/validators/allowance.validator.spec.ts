import { FormControl, FormGroup } from '@angular/forms';
import { allowanceValidator } from './allowance.validator';

describe('allowanceValidator', () => {
  // Monday to Friday: 5 working days.
  const workWeek: [string, string] = ['2026-11-16T10:00:00', '2026-11-20T10:00:00'];

  function createForm([startDate, endDate]: [string | null, string | null], daysLeft: number | undefined): FormGroup {
    return new FormGroup(
      {
        startDate: new FormControl(startDate),
        endDate: new FormControl(endDate),
      },
      { validators: allowanceValidator('startDate', 'endDate', () => daysLeft) },
    );
  }

  it('is valid when the request fits into the days left exactly', () => {
    const form = createForm(workWeek, 5);

    expect(form.hasError('notEnoughDays')).toBe(false);
  });

  it('is invalid when the request needs more working days than are left', () => {
    const form = createForm(workWeek, 4);

    expect(form.getError('notEnoughDays')).toEqual({ left: 4, requested: 5 });
  });

  it('counts only working days, so a weekend in the range does not use the allowance', () => {
    // Friday to Monday: 2 working days.
    const form = createForm(['2026-11-20T10:00:00', '2026-11-23T10:00:00'], 2);

    expect(form.hasError('notEnoughDays')).toBe(false);
  });

  it('does not check anything when the days left are unknown', () => {
    const form = createForm(workWeek, undefined);

    expect(form.hasError('notEnoughDays')).toBe(false);
  });

  it('does not check anything until both dates are chosen', () => {
    const form = createForm([workWeek[0], null], 0);

    expect(form.hasError('notEnoughDays')).toBe(false);
  });
});
