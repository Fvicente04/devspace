// Tests for NotesComponent — list, create, edit, delete, filter, and empty state
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TasksService } from '../tasks/tasks.service';
import { Note } from './note.model';
import { NotesComponent } from './notes.component';
import { NotesService } from './notes.service';

const mockNotes: Note[] = [
  {
    id: 1,
    userId: 1,
    taskId: null,
    title: 'Architecture',
    content: 'Keep notes plain text.',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    userId: 1,
    taskId: 3,
    title: 'Task note',
    content: 'Linked to task.',
    createdAt: '',
    updatedAt: '',
  },
];

describe('NotesComponent', () => {
  let fixture: ComponentFixture<NotesComponent>;
  let notesService: {
    getNotes: ReturnType<typeof vi.fn>;
    createNote: ReturnType<typeof vi.fn>;
    updateNote: ReturnType<typeof vi.fn>;
    deleteNote: ReturnType<typeof vi.fn>;
  };

  async function createComponent(taskId?: number) {
    fixture = TestBed.createComponent(NotesComponent);
    if (taskId) fixture.componentRef.setInput('taskId', taskId);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    notesService = {
      getNotes: vi.fn().mockReturnValue(of(mockNotes)),
      createNote: vi.fn().mockReturnValue(of({ ...mockNotes[0], id: 3, title: 'New', content: 'Body' })),
      updateNote: vi.fn().mockReturnValue(of({ ...mockNotes[0], title: 'Updated', content: 'Updated body' })),
      deleteNote: vi.fn().mockReturnValue(of({ deleted: true })),
    };

    await TestBed.configureTestingModule({
      imports: [NotesComponent],
      providers: [
        { provide: NotesService, useValue: notesService },
        { provide: TasksService, useValue: { getTasks: vi.fn().mockReturnValue(of([])) } },
      ],
    }).compileComponents();
  });

  it('loads notes on init and displays the list', async () => {
    await createComponent();

    expect(notesService.getNotes).toHaveBeenCalledWith(undefined);
    expect(fixture.nativeElement.querySelectorAll('[data-testid="note-item"]').length).toBe(2);
  });

  it('creates a note with inline form and appends it to the list', async () => {
    await createComponent();

    fixture.nativeElement.querySelector('[data-testid="new-note-btn"]').click();
    fixture.detectChanges();

    const titleInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="note-title-input"]');
    const contentInput: HTMLTextAreaElement = fixture.nativeElement.querySelector('[data-testid="note-content-input"]');
    titleInput.value = 'New';
    titleInput.dispatchEvent(new Event('input'));
    contentInput.value = 'Body';
    contentInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('[data-testid="save-create-btn"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notesService.createNote).toHaveBeenCalledWith({ title: 'New', content: 'Body' });
    expect(fixture.nativeElement.querySelectorAll('[data-testid="note-item"]').length).toBe(3);
    expect(fixture.nativeElement.querySelector('[data-testid="note-title-input"]')).toBeFalsy();
  });

  it('edits a note inline and updates the list', async () => {
    await createComponent();

    fixture.nativeElement.querySelector('[data-testid="edit-note-1"]').click();
    fixture.detectChanges();
    const titleInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="note-title-input"]');
    const contentInput: HTMLTextAreaElement = fixture.nativeElement.querySelector('[data-testid="note-content-input"]');
    titleInput.value = 'Updated';
    titleInput.dispatchEvent(new Event('input'));
    contentInput.value = 'Updated body';
    contentInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('[data-testid="save-edit-btn"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notesService.updateNote).toHaveBeenCalledWith(1, { title: 'Updated', content: 'Updated body' });
    expect(fixture.nativeElement.textContent).toContain('Updated');
  });

  it('deletes a note and removes it from the list', async () => {
    await createComponent();

    fixture.nativeElement.querySelector('[data-testid="delete-note-1"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notesService.deleteNote).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelectorAll('[data-testid="note-item"]').length).toBe(1);
  });

  it('filters notes by taskId input', async () => {
    notesService.getNotes.mockReturnValue(of([mockNotes[1]]));

    await createComponent(3);

    expect(notesService.getNotes).toHaveBeenCalledWith(3);
    expect(fixture.nativeElement.querySelectorAll('[data-testid="note-item"]').length).toBe(1);
  });

  it('shows empty state when there are no notes', async () => {
    notesService.getNotes.mockReturnValue(of([]));

    await createComponent();

    expect(fixture.nativeElement.textContent).toContain('No notes yet');
  });
});
