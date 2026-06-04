// Tasks feature component — displays, creates, updates, and deletes user tasks
import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TasksService } from './tasks.service';
import { Task } from './task.model';

@Component({
  selector: 'app-tasks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div>
        <input
          type="text"
          [value]="newTitle()"
          (input)="newTitle.set($any($event.target).value)"
          placeholder="Task title"
        />
        <button (click)="addTask()">Add Task</button>
      </div>
      @for (task of tasks(); track task.id) {
        <div data-testid="task-item">
          <span>{{ task.title }}</span>
          <select [value]="task.status" (change)="updateStatus(task.id, $event)">
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button data-testid="delete-btn" (click)="deleteTask(task.id)">Delete</button>
        </div>
      }
    </div>
  `,
})
export class TasksComponent implements OnInit {
  private service = inject(TasksService);

  tasks = signal<Task[]>([]);
  newTitle = signal('');

  async ngOnInit() {
    const tasks = await firstValueFrom(this.service.getTasks());
    this.tasks.set(tasks);
  }

  async addTask() {
    if (!this.newTitle().trim()) return;
    const created = await firstValueFrom(this.service.createTask({ title: this.newTitle().trim() }));
    this.tasks.update((list) => [...list, created]);
    this.newTitle.set('');
  }

  async updateStatus(id: number, event: Event) {
    const status = (event.target as HTMLSelectElement).value as Task['status'];
    const updated = await firstValueFrom(this.service.updateTask(id, { status }));
    this.tasks.update((list) => list.map((t) => (t.id === id ? updated : t)));
  }

  async deleteTask(id: number) {
    await firstValueFrom(this.service.deleteTask(id));
    this.tasks.update((list) => list.filter((t) => t.id !== id));
  }
}
