// Notes feature component — plain text notes with optional task filter
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Note } from './note.model';
import { NotesService } from './notes.service';

@Component({
  selector: 'app-notes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent implements OnInit {
  private service = inject(NotesService);
  private initialized = false;

  taskId = input<number | null>(null);
  notes = signal<Note[]>([]);
  isCreating = signal(false);
  editingId = signal<number | null>(null);
  newTitle = signal('');
  newContent = signal('');

  private taskFilterEffect = effect(() => {
    const taskId = this.taskId();
    if (!this.initialized) return;
    void this.loadNotes(taskId);
  });

  async ngOnInit() {
    this.initialized = true;
    await this.loadNotes(this.taskId());
  }

  async loadNotes(taskId = this.taskId()) {
    const notes = await firstValueFrom(this.service.getNotes(taskId ?? undefined));
    this.notes.set(notes);
  }

  startCreate() {
    this.isCreating.set(true);
    this.editingId.set(null);
    this.newTitle.set('');
    this.newContent.set('');
  }

  async saveCreate() {
    const taskId = this.taskId();
    const data = {
      title: this.newTitle(),
      content: this.newContent(),
      ...(taskId ? { taskId } : {}),
    };
    const created = await firstValueFrom(this.service.createNote(data));
    this.notes.update((notes) => [created, ...notes]);
    this.isCreating.set(false);
  }

  startEdit(note: Note) {
    this.isCreating.set(false);
    this.editingId.set(note.id);
    this.newTitle.set(note.title || '');
    this.newContent.set(note.content || '');
  }

  async saveEdit(id: number) {
    const data = { title: this.newTitle(), content: this.newContent() };
    const updated = await firstValueFrom(this.service.updateNote(id, data));
    this.notes.update((notes) => notes.map((note) => (note.id === id ? updated : note)));
    this.editingId.set(null);
  }

  async deleteNote(id: number) {
    await firstValueFrom(this.service.deleteNote(id));
    this.notes.update((notes) => notes.filter((note) => note.id !== id));
  }
}
