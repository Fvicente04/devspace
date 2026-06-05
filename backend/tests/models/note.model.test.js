// Tests that the Note model has correct fields and snake_case column mappings
const { Note } = require('../../src/models/note.model');

describe('Note model', () => {
  it('can be imported without throwing', () => {
    expect(Note).toBeDefined();
  });

  it('has the expected fields', () => {
    const attrs = Note.rawAttributes;

    expect(attrs.id).toBeDefined();
    expect(attrs.userId).toBeDefined();
    expect(attrs.taskId).toBeDefined();
    expect(attrs.title).toBeDefined();
    expect(attrs.content).toBeDefined();
    expect(attrs.createdAt).toBeDefined();
    expect(attrs.updatedAt).toBeDefined();
  });

  it('uses explicit snake_case field mappings', () => {
    const attrs = Note.rawAttributes;

    expect(attrs.userId.field).toBe('user_id');
    expect(attrs.taskId.field).toBe('task_id');
    expect(attrs.createdAt.field).toBe('created_at');
    expect(attrs.updatedAt.field).toBe('updated_at');
  });

  it('requires userId and references users table with cascade delete', () => {
    const userId = Note.rawAttributes.userId;

    expect(userId.allowNull).toBe(false);
    expect(userId.references.model).toBe('users');
    expect(userId.onDelete).toBe('CASCADE');
  });

  it('allows taskId to be null and references tasks table with set null delete', () => {
    const taskId = Note.rawAttributes.taskId;

    expect(taskId.allowNull).toBe(true);
    expect(taskId.references.model).toBe('tasks');
    expect(taskId.onDelete).toBe('SET NULL');
  });

  it('allows title and content to be null', () => {
    expect(Note.rawAttributes.title.allowNull).toBe(true);
    expect(Note.rawAttributes.content.allowNull).toBe(true);
    expect(Note.rawAttributes.content.type.constructor.key).toBe('TEXT');
  });
});
