// HTTP service for Pomodoro sessions — no local timer logic here
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ENVIRONMENT } from '../../core/environment.token';
import { PomodoroSession, TimerMode, TodayStats } from './pomodoro.models';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  startSession(data: { taskId: number | null; type: TimerMode }): Observable<PomodoroSession> {
    return this.http.post<PomodoroSession>(`${this.env.apiUrl}/timer/start`, data);
  }

  stopSession(data: { completed: boolean }): Observable<PomodoroSession> {
    return this.http.post<PomodoroSession>(`${this.env.apiUrl}/timer/stop`, data);
  }

  getHistory(): Observable<PomodoroSession[]> {
    return this.http.get<PomodoroSession[]>(`${this.env.apiUrl}/timer/history`);
  }

  getTodayStats(): Observable<TodayStats> {
    return this.http.get<TodayStats>(`${this.env.apiUrl}/timer/today`);
  }
}
