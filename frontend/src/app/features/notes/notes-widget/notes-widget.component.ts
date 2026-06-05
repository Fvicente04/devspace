import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CardComponent } from '../../../shared/card/card.component';
import { Note } from '../note.model';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-notes-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  templateUrl: './notes-widget.component.html',
  styleUrl: './notes-widget.component.css',
})
export class NotesWidgetComponent implements OnInit {
  private service = inject(NotesService);

  notes = signal<Note[]>([]);
  visibleNotes = signal<Note[]>([]);
  isCreating = signal(false);
  editingId = signal<number | null>(null);
  newTitle = signal('');
  newContent = signal('');

  async ngOnInit() {
    const notes = await firstValueFrom(this.service.getNotes());
    this.notes.set(notes);
    this.visibleNotes.set(notes.slice(0, 3));
  }

  startCreate() {
    this.isCreating.set(true);
    this.editingId.set(null);
    this.newTitle.set('');
    this.newContent.set('');
  }

  async saveCreate() {
    const created = await firstValueFrom(
      this.service.createNote({ title: this.newTitle(), content: this.newContent() })
    );
    this.setNotes([created, ...this.notes()]);
    this.isCreating.set(false);
  }

  startEdit(note: Note) {
    this.isCreating.set(false);
    this.editingId.set(note.id);
    this.newTitle.set(note.title || '');
    this.newContent.set(note.content || '');
  }

  async saveEdit(id: number) {
    const updated = await firstValueFrom(
      this.service.updateNote(id, { title: this.newTitle(), content: this.newContent() })
    );
    this.setNotes(this.notes().map((note) => (note.id === id ? updated : note)));
    this.editingId.set(null);
  }

  async deleteNote(id: number) {
    await firstValueFrom(this.service.deleteNote(id));
    this.setNotes(this.notes().filter((note) => note.id !== id));
  }

  private setNotes(notes: Note[]) {
    this.notes.set(notes);
    this.visibleNotes.set(notes.slice(0, 3));
  }
}
