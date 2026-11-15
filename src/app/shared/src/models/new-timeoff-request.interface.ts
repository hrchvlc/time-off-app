import { TimeOffType } from "./timeoff-type.enum";

export interface NewTimeOffRequest {
  employeeId: string;
  endDate: string;
  note?: string;
  startDate: string;
  type: TimeOffType;
}
