import { TimeOffRequestStatus } from './timeoff-request-status.enum';

export interface TimeOffRequestDecision {
  decidedByFullName: string;
  decisionNote?: string;
  requestId: string;
  status: TimeOffRequestStatus;
}
