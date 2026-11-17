import { mockTimeOffRequests } from '../dummy-data';
import { TimeOffRequest, TimeOffRequestStatus, TimeOffType } from '../models';
import { summarizeAllowance } from './allowance.util';

describe('summarizeAllowance', () => {
  function request(type: TimeOffType, status: TimeOffRequestStatus, workingDays: number): TimeOffRequest {
    return { ...mockTimeOffRequests[0], type, status, workingDays };
  }

  it('counts approved days as used and pending ones as pending, whatever the type', () => {
    const summary = summarizeAllowance(
      [
        request(TimeOffType.Vacation, TimeOffRequestStatus.Approved, 9),
        request(TimeOffType.Sick, TimeOffRequestStatus.Approved, 3),
        request(TimeOffType.Personal, TimeOffRequestStatus.Approved, 7),
        request(TimeOffType.Vacation, TimeOffRequestStatus.Pending, 3),
        request(TimeOffType.Personal, TimeOffRequestStatus.Pending, 2),
      ],
      25,
    );

    expect(summary).toEqual({ allowance: 25, used: 19, pending: 5, left: 1 });
  });

  it('ignores rejected requests', () => {
    const summary = summarizeAllowance([request(TimeOffType.Vacation, TimeOffRequestStatus.Rejected, 5)], 25);

    expect(summary).toEqual({ allowance: 25, used: 0, pending: 0, left: 25 });
  });

  it('never shows fewer than 0 days left', () => {
    const summary = summarizeAllowance(
      [
        request(TimeOffType.Vacation, TimeOffRequestStatus.Approved, 20),
        request(TimeOffType.Vacation, TimeOffRequestStatus.Pending, 10),
      ],
      25,
    );

    expect(summary.left).toBe(0);
  });

  it('leaves Anna 1 day in the mock data, so the demo shows the 0-days-left state after one more request', () => {
    const annasRequests = mockTimeOffRequests.filter((mockRequest) => mockRequest.employeeId === 'emp-101');

    expect(summarizeAllowance(annasRequests, 25)).toEqual({ allowance: 25, used: 19, pending: 5, left: 1 });
  });
});
