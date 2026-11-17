import type { Meta, StoryObj } from '@storybook/angular-vite';
import { AllowanceSummaryComponent } from './allowance-summary.component';

const meta: Meta<AllowanceSummaryComponent> = {
  title: 'Shared/Allowance summary',
  component: AllowanceSummaryComponent,
  tags: ['autodocs'],
  args: {
    summary: { allowance: 25, used: 19, pending: 5, left: 1 },
  },
};

export default meta;

type Story = StoryObj<AllowanceSummaryComponent>;

export const UsedAndPending: Story = {};

export const NothingUsedYet: Story = {
  args: { summary: { allowance: 25, used: 0, pending: 0, left: 25 } },
};

export const AllUsed: Story = {
  args: { summary: { allowance: 25, used: 25, pending: 0, left: 0 } },
};
