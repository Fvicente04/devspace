export type TimerMode = 'focus' | 'short_break' | 'long_break';
export type TimerState = 'idle' | 'running' | 'paused';

export const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export interface PomodoroSession {
  id: number;
  taskId: number | null;
  type: TimerMode;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  completed: boolean;
}

export interface TodayStats {
  totalMinutes: number;
  completedSessions: number;
}
