import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CardComponent } from '../../../shared/card/card.component';
import { Task } from '../task.model';
import { TasksService } from '../tasks.service';

const nextStatus: Record<Task['status'], Task['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

@Component({
  selector: 'app-tasks-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  templateUrl: './tasks-widget.component.html',
  styleUrl: './tasks-widget.component.css',
})
export class TasksWidgetComponent implements OnInit {
  private service = inject(TasksService);

  @ViewChild('taskTitleInput') private taskTitleInput?: ElementRef<HTMLInputElement>;

  tasks = signal<Task[]>([]);
  newTitle = signal('');

  async ngOnInit() {
    this.tasks.set(await firstValueFrom(this.service.getTasks()));
  }

  async addTask() {
    const title = this.newTitle().trim();
    if (!title) return;

    const created = await firstValueFrom(this.service.createTask({ title }));
    this.tasks.update((tasks) => [created, ...tasks]);
    this.newTitle.set('');
  }

  async cycleStatus(task: Task) {
    const updated = await firstValueFrom(this.service.updateTask(task.id, { status: nextStatus[task.status] }));
    this.tasks.update((tasks) => tasks.map((item) => (item.id === task.id ? updated : item)));
  }

  async deleteTask(id: number) {
    await firstValueFrom(this.service.deleteTask(id));
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }

  selectTaskForPomodoro(taskId: number) {
    window.dispatchEvent(new CustomEvent('devspace:start-pomodoro', { detail: { taskId } }));
  }

  @HostListener('window:devspace:new-task')
  focusNewTaskInput() {
    this.taskTitleInput?.nativeElement.focus();
  }
}
