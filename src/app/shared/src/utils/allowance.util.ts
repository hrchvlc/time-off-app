import { AllowanceSummary, TimeOffRequest, TimeOffRequestStatus } from '../models';

/**
 * Sums up the days off of every type, all of them count towards the allowance.
 * Calculated from the requests, so it stays correct after each approval or rejection.
 * Pending days are already taken out of "left", so it shows what can still be requested.
 */
export function summarizeAllowance(requests: TimeOffRequest[], allowance: number): AllowanceSummary {
  const used = sumWorkingDays(requests, TimeOffRequestStatus.Approved);
  const pending = sumWorkingDays(requests, TimeOffRequestStatus.Pending);

  return {
    allowance,
    used,
    pending,
    left: Math.max(allowance - used - pending, 0),
  };
}

function sumWorkingDays(requests: TimeOffRequest[], status: TimeOffRequestStatus): number {
  return requests
    .filter((request) => request.status === status)
    .reduce((total, request) => total + request.workingDays, 0);
}
