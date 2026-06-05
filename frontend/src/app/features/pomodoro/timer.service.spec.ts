// Tests that TimerService makes the correct HTTP calls for Pomodoro sessions
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ENVIRONMENT } from '../../core/environment.token';
import { TimerService } from './timer.service';
import { PomodoroSession, TodayStats } from './pomodoro.models';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('TimerService', () => {
  let service: TimerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TimerService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });

    service = TestBed.inject(TimerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('startSession(data) posts to /timer/start', () => {
    const data = { taskId: 1, type: 'focus' as const };
    const session: PomodoroSession = {
      id: 1,
      taskId: 1,
      type: 'focus',
      startedAt: '',
      endedAt: null,
      durationMinutes: null,
      completed: false,
    };

    service.startSession(data).subscribe((result) => expect(result).toEqual(session));

    const req = httpMock.expectOne('http://localhost:3000/timer/start');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(session);
  });

  it('stopSession(data) posts to /timer/stop', () => {
    const data = { completed: true };
    const session: PomodoroSession = {
      id: 1,
      taskId: 1,
      type: 'focus',
      startedAt: '',
      endedAt: '',
      durationMinutes: 25,
      completed: true,
    };

    service.stopSession(data).subscribe((result) => expect(result).toEqual(session));

    const req = httpMock.expectOne('http://localhost:3000/timer/stop');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(session);
  });

  it('getHistory() gets /timer/history', () => {
    const sessions: PomodoroSession[] = [];

    service.getHistory().subscribe((result) => expect(result).toEqual(sessions));

    const req = httpMock.expectOne('http://localhost:3000/timer/history');
    expect(req.request.method).toBe('GET');
    req.flush(sessions);
  });

  it('getTodayStats() gets /timer/today', () => {
    const stats: TodayStats = { totalMinutes: 25, completedSessions: 1 };

    service.getTodayStats().subscribe((result) => expect(result).toEqual(stats));

    const req = httpMock.expectOne('http://localhost:3000/timer/today');
    expect(req.request.method).toBe('GET');
    req.flush(stats);
  });
});
