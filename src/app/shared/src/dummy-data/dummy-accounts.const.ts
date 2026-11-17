import { Account, Role } from '../models';

export const dummyAccounts: Account[] = [
  {
    id: 'emp-101',
    name: 'Anna Nováková',
    role: Role.Employee,
    timeOffAllowance: 25,
  },
  {
    id: 'emp-103',
    name: 'Petra Černá',
    role: Role.Employee,
    timeOffAllowance: 25,
  },
  {
    id: 'emp-202',
    name: 'Lucie Králová',
    role: Role.Supervisor,
  },
];
