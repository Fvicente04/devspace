// Tests that TasksService makes the correct HTTP calls for each CRUD operation
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TasksService } from './tasks.service';
import { ENVIRONMENT } from '../../core/environment.token';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TasksService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getTasks()', () => {
    it('makes GET request to /tasks and returns tasks array', () => {
      const mockTasks = [{ id: 1, title: 'Task 1', status: 'todo' }];
      service.getTasks().subscribe((tasks) => {
        expect(tasks).toEqual(mockTasks);
      });
      const req = httpMock.expectOne('http://localhost:3000/tasks');
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });

  describe('createTask(data)', () => {
    it('makes POST request to /tasks with the given data', () => {
      const data = { title: 'New task' };
      service.createTask(data).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush({ id: 1, title: 'New task', status: 'todo' });
    });
  });

  describe('updateTask(id, data)', () => {
    it('makes PATCH request to /tasks/:id with the given data', () => {
      const data = { status: 'done' as const };
      service.updateTask(1, data).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/tasks/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(data);
      req.flush({ id: 1, status: 'done' });
    });
  });

  describe('deleteTask(id)', () => {
    it('makes DELETE request to /tasks/:id', () => {
      service.deleteTask(1).subscribe();
      const req = httpMock.expectOne('http://localhost:3000/tasks/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ deleted: true });
    });
  });
});
