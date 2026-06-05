// HTTP service for notes — CRUD operations against the backend /notes endpoint
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ENVIRONMENT } from '../../core/environment.token';
import { CreateNoteDto, Note, UpdateNoteDto } from './note.model';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  getNotes(taskId?: number): Observable<Note[]> {
    const url = taskId ? `${this.env.apiUrl}/notes?taskId=${taskId}` : `${this.env.apiUrl}/notes`;
    return this.http.get<Note[]>(url);
  }

  createNote(data: CreateNoteDto): Observable<Note> {
    return this.http.post<Note>(`${this.env.apiUrl}/notes`, data);
  }

  updateNote(id: number, data: UpdateNoteDto): Observable<Note> {
    return this.http.patch<Note>(`${this.env.apiUrl}/notes/${id}`, data);
  }

  deleteNote(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.env.apiUrl}/notes/${id}`);
  }
}
