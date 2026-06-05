// Tests for TasksWidgetComponent — create, status cycle, delete, and inline edit flows
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Task } from '../task.model';
import { TasksService } from '../tasks.service';
import { TasksWidgetComponent } from './tasks-widget.component';

const mockTasks: Task[] = [
  { id: 1, userId: 1, title: 'Write tests', status: 'todo', createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, title: 'Ship feature', status: 'in_progress', createdAt: '', updatedAt: '' },
];

describe('TasksWidgetComponent', () => {
  let fixture: ComponentFixture<TasksWidgetComponent>;
  let tasksService: {
    getTasks: ReturnType<typeof vi.fn>;
    createTask: ReturnType<typeof vi.fn>;
    updateTask: ReturnType<typeof vi.fn>;
    deleteTask: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    tasksService = {
      getTasks: vi.fn().mockReturnValue(of(mockTasks)),
      createTask: vi.fn().mockReturnValue(of({ id: 3, userId: 1, title: 'New task', status: 'todo', createdAt: '', updatedAt: '' } as Task)),
      updateTask: vi.fn().mockReturnValue(of({ ...mockTasks[0], title: 'Updated title' })),
      deleteTask: vi.fn().mockReturnValue(of({ deleted: true })),
    };

    await TestBed.configureTestingModule({
      imports: [TasksWidgetComponent],
      providers: [{ provide: TasksService, useValue: tasksService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('loads and displays tasks on init', () => {
    expect(tasksService.getTasks).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="task-item"]').length).toBe(2);
  });

  it('shows an edit button for each task', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="edit-task-1"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="edit-task-2"]')).toBeTruthy();
  });

  it('enters edit mode and shows input with current title when edit button is clicked', () => {
    fixture.nativeElement.querySelector('[data-testid="edit-task-1"]').click();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="task-edit-input"]');
    expect(input).toBeTruthy();
    expect(input.value).toBe('Write tests');
  });

  it('calls updateTask with new title when save is clicked', async () => {
    fixture.nativeElement.querySelector('[data-testid="edit-task-1"]').click();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="task-edit-input"]');
    input.value = 'Updated title';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('[data-testid="save-edit-btn"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(tasksService.updateTask).toHaveBeenCalledWith(1, { title: 'Updated title' });
    expect(fixture.nativeElement.querySelector('[data-testid="task-edit-input"]')).toBeFalsy();
    expect(fixture.nativeElement.textContent).toContain('Updated title');
  });

  it('cancels edit without saving when cancel is clicked', async () => {
    fixture.nativeElement.querySelector('[data-testid="edit-task-1"]').click();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="task-edit-input"]');
    input.value = 'Should not be saved';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('[data-testid="cancel-edit-btn"]').click();
    fixture.detectChanges();

    expect(tasksService.updateTask).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-testid="task-edit-input"]')).toBeFalsy();
    expect(fixture.nativeElement.textContent).toContain('Write tests');
  });

  it('does not call updateTask when title is unchanged on save', async () => {
    fixture.nativeElement.querySelector('[data-testid="edit-task-1"]').click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-testid="save-edit-btn"]').click();
    await fixture.whenStable();

    expect(tasksService.updateTask).not.toHaveBeenCalled();
  });
});
