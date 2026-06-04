// Shared Task interface — matches the backend tasks table shape
export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  githubIssueUrl?: string;
  createdAt: string;
  updatedAt: string;
}
