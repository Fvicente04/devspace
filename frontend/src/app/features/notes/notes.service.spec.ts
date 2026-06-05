// Tests that NotesService makes the correct HTTP calls for notes CRUD
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ENVIRONMENT } from '../../core/environment.token';
import { Note } from './note.model';
import { NotesService } from './notes.service';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('NotesService', () => {
  let service: NotesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotesService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });

    service = TestBed.inject(NotesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getNotes() makes GET request to /notes', () => {
    const notes: Note[] = [];

    service.getNotes().subscribe((result) => expect(result).toEqual(notes));

    const req = httpMock.expectOne('http://localhost:3000/notes');
    expect(req.request.method).toBe('GET');
    req.flush(notes);
  });

  it('getNotes(taskId) makes GET request with taskId query param', () => {
    service.getNotes(2).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/notes?taskId=2');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('createNote(data) makes POST request to /notes', () => {
    const data = { title: 'New', content: 'Body', taskId: null };
    const note = { id: 1, userId: 1, ...data, createdAt: '', updatedAt: '' };

    service.createNote(data).subscribe((result) => expect(result).toEqual(note));

    const req = httpMock.expectOne('http://localhost:3000/notes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(note);
  });

  it('updateNote(id, data) makes PATCH request to /notes/:id', () => {
    const data = { title: 'Updated', content: 'Updated body' };

    service.updateNote(1, data).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/notes/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 1, userId: 1, taskId: null, ...data, createdAt: '', updatedAt: '' });
  });

  it('deleteNote(id) makes DELETE request to /notes/:id', () => {
    service.deleteNote(1).subscribe((result) => expect(result).toEqual({ deleted: true }));

    const req = httpMock.expectOne('http://localhost:3000/notes/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ deleted: true });
  });
});
