// Tests for PomodoroComponent — local timer logic, task selection, and today stats
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PomodoroComponent } from './pomodoro.component';
import { TimerService } from './timer.service';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/task.model';
import { PomodoroSession, TodayStats } from './pomodoro.models';

const mockTasks: Task[] = [
  { id: 1, userId: 1, title: 'Write tests', status: 'todo', createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, title: 'Ship timer', status: 'in_progress', createdAt: '', updatedAt: '' },
];

const activeSession: PomodoroSession = {
  id: 1,
  taskId: 1,
  type: 'focus',
  startedAt: '',
  endedAt: null,
  durationMinutes: null,
  completed: false,
};

describe('PomodoroComponent', () => {
  let fixture: ComponentFixture<PomodoroComponent>;
  let timerService: {
    startSession: ReturnType<typeof vi.fn>;
    stopSession: ReturnType<typeof vi.fn>;
    getTodayStats: ReturnType<typeof vi.fn>;
  };
  let tasksService: { getTasks: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    timerService = {
      startSession: vi.fn().mockReturnValue(of(activeSession)),
      stopSession: vi.fn().mockReturnValue(of({ ...activeSession, completed: true })),
      getTodayStats: vi.fn().mockReturnValue(of({ totalMinutes: 50, completedSessions: 2 } satisfies TodayStats)),
    };
    tasksService = {
      getTasks: vi.fn().mockReturnValue(of(mockTasks)),
    };
    const AudioContextMock = vi.fn(function (this: any) {
      this.createOscillator = vi.fn().mockReturnValue({
        connect: vi.fn(),
        frequency: { value: 0 },
        start: vi.fn(),
        stop: vi.fn(),
      });
      this.createGain = vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      });
      this.destination = {};
      this.currentTime = 0;
    });
    vi.stubGlobal('AudioContext', AudioContextMock);

    await TestBed.configureTestingModule({
      imports: [PomodoroComponent],
      providers: [
        { provide: TimerService, useValue: timerService },
        { provide: TasksService, useValue: tasksService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PomodoroComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    vi.useFakeTimers();
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('starts in focus idle mode with 25:00 displayed and Start visible', () => {
    expect(fixture.componentInstance.mode()).toBe('focus');
    expect(fixture.componentInstance.state()).toBe('idle');
    expect(fixture.nativeElement.querySelector('[data-testid="timer-display"]').textContent).toContain('25:00');
    expect(fixture.nativeElement.querySelector('[data-testid="start-btn"]').textContent).toContain('Start');
  });

  it('switches modes only while idle', async () => {
    fixture.nativeElement.querySelector('[data-testid="mode-short_break"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="timer-display"]').textContent).toContain('05:00');

    fixture.nativeElement.querySelector('[data-testid="mode-long_break"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="timer-display"]').textContent).toContain('15:00');

    fixture.nativeElement.querySelector('[data-testid="mode-focus"]').click();
    fixture.nativeElement.querySelector('[data-testid="start-btn"]').click();
    await Promise.resolve();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-testid="mode-short_break"]').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.mode()).toBe('focus');
    expect(fixture.nativeElement.querySelector('[data-testid="timer-display"]').textContent).toContain('25:00');
  });

  it('starts a session, counts down, and auto-completes at zero', async () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('[data-testid="task-select"]');
    select.value = '1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-testid="start-btn"]').click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(timerService.startSession).toHaveBeenCalledWith({ type: 'focus', taskId: 1 });
    expect(fixture.componentInstance.state()).toBe('running');

    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="timer-display"]').textContent).toContain('24:59');

    vi.advanceTimersByTime(24 * 60 * 1000 + 59 * 1000);
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="timer-display"]').textContent).toContain('00:00');
    expect(timerService.stopSession).toHaveBeenCalledWith({ completed: true });
  });

  it('stops manually and resets the current mode', async () => {
    fixture.nativeElement.querySelector('[data-testid="start-btn"]').click();
    await Promise.resolve();
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="stop-btn"]').click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(timerService.stopSession).toHaveBeenCalledWith({ completed: false });
    expect(fixture.componentInstance.state()).toBe('idle');
    expect(fixture.nativeElement.querySelector('[data-testid="timer-display"]').textContent).toContain('25:00');
  });

  it('renders tasks, updates selectedTaskId, and shows selected task while running', async () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('[data-testid="task-select"]');
    expect(select.options.length).toBe(3);

    select.value = '2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedTaskId()).toBe(2);

    fixture.nativeElement.querySelector('[data-testid="start-btn"]').click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="active-task"]').textContent).toContain('Ship timer');
  });

  it('plays an audio notification via AudioContext when the timer completes', async () => {
    fixture.nativeElement.querySelector('[data-testid="start-btn"]').click();
    await Promise.resolve();
    fixture.detectChanges();

    vi.advanceTimersByTime(25 * 60 * 1000);
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(AudioContext).toHaveBeenCalled();
  });

  it('loads today stats and renders max four Pomodoro dots', () => {
    expect(timerService.getTodayStats).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-testid="total-minutes"]').textContent).toContain('50');
    expect(fixture.nativeElement.querySelector('[data-testid="completed-sessions"]').textContent).toContain('2');
    expect(fixture.nativeElement.querySelectorAll('[data-testid="pomo-dot"].filled').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('[data-testid="pomo-dot"]').length).toBe(4);
  });
});
