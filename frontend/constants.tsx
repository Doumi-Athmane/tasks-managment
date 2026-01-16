
import { User, TaskPriority, TaskStatus } from './types';

export const PRIORITY_COLORS = {
  [TaskPriority.MINOR]: 'bg-green-100 text-green-800',
  [TaskPriority.LOW]: 'bg-blue-100 text-blue-800',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriority.HIGH]: 'bg-red-100 text-red-800',
  [TaskPriority.CRITICAL]: 'bg-red-100 text-red-800',
};

export const STATUS_COLORS = {
  [TaskStatus.TODO]: 'bg-blue-100 text-blue-800',
  [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800',
  [TaskStatus.DELETED]: 'bg-red-100 text-red-800',
};
