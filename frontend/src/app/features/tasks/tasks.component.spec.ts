// Tests for TasksComponent — covers init, create, status update, and delete flows
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { TasksComponent } from './tasks.component';
import { TasksService } from './tasks.service';
import { ENVIRONMENT } from '../../core/environment.token';
import { Task } from './task.model';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

const mockTasks: Task[] = [
  { id: 1, userId: 1, title: 'Task 1', status: 'todo', createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, title: 'Task 2', status: 'in_progress', createdAt: '', updatedAt: '' },
];

describe('TasksComponent', () => {
  let fixture: ComponentFixture<TasksComponent>;
  let tasksService: TasksService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    }).compileComponents();
    tasksService = TestBed.inject(TasksService);
  });

  it('calls getTasks on init and displays the task list', async () => {
    vi.spyOn(tasksService, 'getTasks').mockReturnValue(of(mockTasks));
    fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(tasksService.getTasks).toHaveBeenCalled();
    const items = fixture.nativeElement.querySelectorAll('[data-testid="task-item"]');
    expect(items.length).toBe(2);
  });

  it('renders an input and an Add Task button', async () => {
    vi.spyOn(tasksService, 'getTasks').mockReturnValue(of([]));
    fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[type="text"]');
    const button = fixture.nativeElement.querySelector('button');
    expect(input).toBeTruthy();
    expect(button.textContent).toContain('Add Task');
  });

  it('calls createTask when Add Task is clicked with a title', async () => {
    vi.spyOn(tasksService, 'getTasks').mockReturnValue(of([]));
    const created: Task = { id: 3, userId: 1, title: 'New task', status: 'todo', createdAt: '', updatedAt: '' };
    const createSpy = vi.spyOn(tasksService, 'createTask').mockReturnValue(of(created));
    fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    input.value = 'New task';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(createSpy).toHaveBeenCalledWith({ title: 'New task' });
  });

  it('does not call createTask when the input is empty', async () => {
    vi.spyOn(tasksService, 'getTasks').mockReturnValue(of([]));
    const createSpy = vi.spyOn(tasksService, 'createTask').mockReturnValue(of({} as Task));
    fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button').click();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('calls updateTask when the status selector changes', async () => {
    vi.spyOn(tasksService, 'getTasks').mockReturnValue(of(mockTasks));
    const updated: Task = { ...mockTasks[0], status: 'done' };
    const updateSpy = vi.spyOn(tasksService, 'updateTask').mockReturnValue(of(updated));
    fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = 'done';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(updateSpy).toHaveBeenCalledWith(1, { status: 'done' });
  });

  it('calls deleteTask when the Delete button is clicked', async () => {
    vi.spyOn(tasksService, 'getTasks').mockReturnValue(of(mockTasks));
    const deleteSpy = vi.spyOn(tasksService, 'deleteTask').mockReturnValue(of({ deleted: true }));
    fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelectorAll('[data-testid="delete-btn"]')[0];
    deleteBtn.click();
    await fixture.whenStable();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
