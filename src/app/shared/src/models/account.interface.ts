import { Role } from "./role.enum";

export interface Account {
  id: string;
  name: string;
  role: Role;
  timeOffAllowance?: number;
  timeOffSpent?: number;
}
