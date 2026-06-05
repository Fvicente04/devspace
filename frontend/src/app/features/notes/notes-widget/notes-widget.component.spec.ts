// Tests for NotesWidgetComponent — create, edit, and delete flows
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Note } from '../note.model';
import { NotesService } from '../notes.service';
import { NotesWidgetComponent } from './notes-widget.component';

const mockNotes: Note[] = [
  { id: 1, userId: 1, taskId: null, title: 'First note', content: 'Content A', createdAt: '', updatedAt: '' },
  { id: 2, userId: 1, taskId: null, title: 'Second note', content: 'Content B', createdAt: '', updatedAt: '' },
];

describe('NotesWidgetComponent', () => {
  let fixture: ComponentFixture<NotesWidgetComponent>;
  let notesService: {
    getNotes: ReturnType<typeof vi.fn>;
    createNote: ReturnType<typeof vi.fn>;
    updateNote: ReturnType<typeof vi.fn>;
    deleteNote: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    notesService = {
      getNotes: vi.fn().mockReturnValue(of(mockNotes)),
      createNote: vi.fn().mockReturnValue(of({ id: 3, userId: 1, taskId: null, title: 'New', content: 'Body', createdAt: '', updatedAt: '' })),
      updateNote: vi.fn().mockReturnValue(of({ ...mockNotes[0], title: 'Updated', content: 'Updated body' })),
      deleteNote: vi.fn().mockReturnValue(of({ deleted: true })),
    };

    await TestBed.configureTestingModule({
      imports: [NotesWidgetComponent],
      providers: [{ provide: NotesService, useValue: notesService }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('loads and displays up to 3 notes on init', () => {
    expect(notesService.getNotes).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.note-item').length).toBe(2);
  });

  it('renders a delete button for each note', () => {
    const deleteBtn1 = fixture.nativeElement.querySelector('[data-testid="delete-note-1"]');
    const deleteBtn2 = fixture.nativeElement.querySelector('[data-testid="delete-note-2"]');
    expect(deleteBtn1).toBeTruthy();
    expect(deleteBtn2).toBeTruthy();
  });

  it('calls deleteNote and removes the note from the list', async () => {
    fixture.nativeElement.querySelector('[data-testid="delete-note-1"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notesService.deleteNote).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelectorAll('.note-item').length).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('First note');
  });

  it('creates a note and prepends it to the list', async () => {
    fixture.nativeElement.querySelector('.card-action').click();
    fixture.detectChanges();

    const titleInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    const contentInput: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    titleInput.value = 'New';
    titleInput.dispatchEvent(new Event('input'));
    contentInput.value = 'Body';
    contentInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('button[type="button"].btn-primary').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notesService.createNote).toHaveBeenCalledWith({ title: 'New', content: 'Body' });
    expect(fixture.nativeElement.querySelectorAll('.note-item').length).toBe(3);
  });

  it('edits a note inline and updates the list', async () => {
    fixture.nativeElement.querySelector('.note-item').click();
    fixture.detectChanges();

    const titleInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    titleInput.value = 'Updated';
    titleInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('button[type="button"].btn-primary').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notesService.updateNote).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Updated' }));
    expect(fixture.nativeElement.textContent).toContain('Updated');
  });
});
