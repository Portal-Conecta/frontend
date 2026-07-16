import type { Meta, StoryObj } from '@storybook/react';
import { CreateCourseForm } from './CreateCourseForm';

const meta: Meta<typeof CreateCourseForm> = {
  title: 'CURSOS/Molecules/CreateCourseForm',
  component: CreateCourseForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreateCourseForm>;

export const Default: Story = {};