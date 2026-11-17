import { TimeOffRequestStatus } from './timeoff-request-status.enum';
import { TimeOffType } from './timeoff-type.enum';

export interface TimeOffRequest {
  createdAt: string;
  decidedByFullName?: string;
  decisionNote?: string;
  employeeFullName: string;
  employeeId: string;
  endDate: string;
  id: string;
  note?: string;
  startDate: string;
  status: TimeOffRequestStatus;
  type: TimeOffType;
  workingDays: number;
}
