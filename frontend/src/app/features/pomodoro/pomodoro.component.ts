// Pomodoro feature component — local countdown logic with backend start/stop persistence
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Task } from '../tasks/task.model';
import { TasksService } from '../tasks/tasks.service';
import { formatTime } from '../../shared/utils/format-time';
import { TIMER_DURATIONS, TimerMode, TimerState, TodayStats } from './pomodoro.models';
import { TimerService } from './timer.service';

@Component({
  selector: 'app-pomodoro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pomodoro.component.html',
  styleUrl: './pomodoro.component.css',
})
export class PomodoroComponent implements OnInit, OnDestroy {
  private timerService = inject(TimerService);
  private tasksService = inject(TasksService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  mode = signal<TimerMode>('focus');
  state = signal<TimerState>('idle');
  secondsLeft = signal(TIMER_DURATIONS.focus);
  selectedTaskId = signal<number | null>(null);
  todayStats = signal<TodayStats>({ totalMinutes: 0, completedSessions: 0 });
  tasks = signal<Task[]>([]);

  displayTime = computed(() => formatTime(this.secondsLeft()));
  selectedTask = computed(() => this.tasks().find((task) => task.id === this.selectedTaskId()));
  pomoDots = computed(() =>
    [0, 1, 2, 3].map((index) => index < Math.min(this.todayStats().completedSessions, 4))
  );

  async ngOnInit() {
    const [tasks, todayStats] = await Promise.all([
      firstValueFrom(this.tasksService.getTasks()),
      firstValueFrom(this.timerService.getTodayStats()),
    ]);

    this.tasks.set(tasks);
    this.todayStats.set(todayStats);
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  switchMode(mode: TimerMode) {
    if (this.state() !== 'idle') return;

    this.mode.set(mode);
    this.secondsLeft.set(TIMER_DURATIONS[mode]);
  }

  updateSelectedTask(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedTaskId.set(value ? Number(value) : null);
  }

  @HostListener('window:devspace:start-pomodoro', ['$event'])
  selectTaskFromDashboard(event: Event) {
    if (this.state() !== 'idle') return;
    const taskId = (event as CustomEvent<{ taskId: number }>).detail.taskId;
    this.selectedTaskId.set(taskId);
  }

  async startTimer() {
    await firstValueFrom(
      this.timerService.startSession({ type: this.mode(), taskId: this.selectedTaskId() })
    );

    this.state.set('running');
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  async stopTimer(completed: boolean) {
    this.clearTimer();
    await firstValueFrom(this.timerService.stopSession({ completed }));
    this.state.set('idle');

    if (completed) {
      this.secondsLeft.set(0);
      this.playNotification();
      await this.loadTodayStats();
      return;
    }

    this.secondsLeft.set(TIMER_DURATIONS[this.mode()]);
  }

  private tick() {
    const nextSeconds = Math.max(this.secondsLeft() - 1, 0);
    this.secondsLeft.set(nextSeconds);

    if (nextSeconds === 0) {
      void this.stopTimer(true);
    }
  }

  private clearTimer() {
    if (!this.intervalId) return;

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private async loadTodayStats() {
    const stats = await firstValueFrom(this.timerService.getTodayStats());
    this.todayStats.set(stats);
  }

  private playNotification() {
    if (typeof AudioContext === 'undefined') return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  }
}
