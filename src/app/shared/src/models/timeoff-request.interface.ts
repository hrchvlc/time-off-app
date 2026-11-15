import { TypeOffRequestStatus } from "./timeoff-request-status.enum";
import { TimeOffType } from "./timeoff-type.enum";

export interface TimeOffRequest {
  createdAt: string;
  decidedAt?: string;
  decidedByFullName?: string;
  decisionNote?: string;
  employeeFullName: string;
  employeeId: string;
  endDate: string;
  id: string;
  note?: string;
  startDate: string;
  status: TypeOffRequestStatus;
  timeOffAllowance: number;
  timeOffSpent: number;
  type: TimeOffType;
  workingDays: number;
}
