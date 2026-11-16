import { TypeOffRequestStatus } from "./timeoff-request-status.enum";

export interface ChangeRequest {
  id: string;
  status: TypeOffRequestStatus;
}
