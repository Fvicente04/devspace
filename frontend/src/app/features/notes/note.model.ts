export interface Note {
  id: number;
  userId: number;
  taskId: number | null;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title?: string;
  content?: string;
  taskId?: number | null;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
}
