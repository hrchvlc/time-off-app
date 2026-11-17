import type { Meta, StoryObj } from '@storybook/angular-vite';
import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Shared/Empty state',
  component: EmptyStateComponent,
  tags: ['autodocs'],
  args: {
    title: 'No past requests',
  },
};

export default meta;

type Story = StoryObj<EmptyStateComponent>;

export const TitleOnly: Story = {};

export const WithMessage: Story = {
  args: {
    title: 'No pending requests',
    message: 'Your work is done',
  },
};
