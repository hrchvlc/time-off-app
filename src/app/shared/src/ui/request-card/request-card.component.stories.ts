import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { mockTimeOffRequests } from '../../dummy-data';
import { TimeOffRequest, TimeOffRequestStatus, TimeOffType } from '../../models';
import { RequestCardComponent } from './request-card.component';

const approvedRequest: TimeOffRequest = mockTimeOffRequests[0];

const pendingRequest: TimeOffRequest = {
  ...approvedRequest,
  status: TimeOffRequestStatus.Pending,
  decidedByFullName: undefined,
  decisionNote: undefined,
};

const rejectedRequest: TimeOffRequest = {
  ...approvedRequest,
  status: TimeOffRequestStatus.Rejected,
  decidedByFullName: 'Lucie Králová',
  decisionNote: 'Overlaps with the year-end release. Please pick different dates.',
};

/**
 * Status is shown as a badge for both roles. Toggle `isSupervisor` in Controls on any story
 * to see the supervisor version, which adds the employee's name.
 */
const meta: Meta<RequestCardComponent> = {
  title: 'Shared/Request card',
  component: RequestCardComponent,
  tags: ['autodocs'],
  args: {
    timeOffRequest: pendingRequest,
    isSupervisor: false,
    busy: false,
    // Shows up in the Actions panel when Approve or Reject is clicked.
    statusChanged: fn(),
  },
};

export default meta;

type Story = StoryObj<RequestCardComponent>;

export const Pending: Story = {};

export const Approved: Story = {
  args: { timeOffRequest: approvedRequest },
};

export const Rejected: Story = {
  args: { timeOffRequest: rejectedRequest },
};

export const SingleDayWithoutNote: Story = {
  args: {
    timeOffRequest: {
      ...pendingRequest,
      type: TimeOffType.Personal,
      startDate: '2026-11-27T09:15:00.000Z',
      endDate: '2026-11-27T09:15:00.000Z',
      workingDays: 1,
      note: undefined,
    },
  },
};

/** A pending request is the only case where the supervisor sees something different: Approve and Reject instead of the badge. */
export const SupervisorDecision: Story = {
  args: { isSupervisor: true },
};

/** While the supervisor's decision is being saved, Approve and Reject are disabled so it cannot be sent twice. */
export const SupervisorDecisionSaving: Story = {
  args: { isSupervisor: true, busy: true },
};
