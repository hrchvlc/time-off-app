import { Account, Role } from "../models";

export const dummyAccounts: Account[] = [
  {
    id: "1234",
    name: "Dummy Employee",
    role: Role.Employee,
  },
  {
    id: "4321",
    name: "Dummy Supervisor",
    role: Role.Supervisor,

  }
];
