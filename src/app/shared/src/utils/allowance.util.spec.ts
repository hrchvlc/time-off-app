import { mockTimeOffRequests } from '../dummy-data';
import { TimeOffRequest, TimeOffType, TypeOffRequestStatus } from '../models';
import { summarizeAllowance } from './allowance.util';

describe('summarizeAllowance', () => {
  function request(type: TimeOffType, status: TypeOffRequestStatus, workingDays: number): TimeOffRequest {
    return { ...mockTimeOffRequests[0], type, status, workingDays };
  }

  it('counts approved days as used and pending ones as pending, whatever the type', () => {
    const summary = summarizeAllowance([
      request(TimeOffType.Vacation, TypeOffRequestStatus.Approved, 9),
      request(TimeOffType.Sick, TypeOffRequestStatus.Approved, 3),
      request(TimeOffType.Personal, TypeOffRequestStatus.Approved, 7),
      request(TimeOffType.Vacation, TypeOffRequestStatus.Pending, 3),
      request(TimeOffType.Personal, TypeOffRequestStatus.Pending, 2),
    ], 25);

    expect(summary).toEqual({ allowance: 25, used: 19, pending: 5, left: 1 });
  });

  it('ignores rejected requests', () => {
    const summary = summarizeAllowance([ request(TimeOffType.Vacation, TypeOffRequestStatus.Rejected, 5) ], 25);

    expect(summary).toEqual({ allowance: 25, used: 0, pending: 0, left: 25 });
  });

  it('never shows fewer than 0 days left', () => {
    const summary = summarizeAllowance([
      request(TimeOffType.Vacation, TypeOffRequestStatus.Approved, 20),
      request(TimeOffType.Vacation, TypeOffRequestStatus.Pending, 10),
    ], 25);

    expect(summary.left).toBe(0);
  });

  it('matches the allowance already spent in the mock data', () => {
    const annasRequests = mockTimeOffRequests.filter((mockRequest) => mockRequest.employeeId === 'emp-101');

    expect(summarizeAllowance(annasRequests, 25).used).toBe(annasRequests[0].timeOffSpent);
  });
});
