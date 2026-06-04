// HTTP service for tasks — all CRUD operations against the backend /tasks endpoint
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../core/environment.token';
import { Task } from './task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.env.apiUrl}/tasks`);
  }

  createTask(data: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.env.apiUrl}/tasks`, data);
  }

  updateTask(id: number, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.env.apiUrl}/tasks/${id}`, data);
  }

  deleteTask(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.env.apiUrl}/tasks/${id}`);
  }
}
