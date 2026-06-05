// Tests that the PomodoroSession model has correct fields and snake_case column mappings
const { PomodoroSession } = require('../../src/models/pomodoro-session.model');

describe('PomodoroSession model', () => {
  it('can be imported without throwing', () => {
    expect(PomodoroSession).toBeDefined();
  });

  it('has the expected fields', () => {
    const attrs = PomodoroSession.rawAttributes;

    expect(attrs.id).toBeDefined();
    expect(attrs.userId).toBeDefined();
    expect(attrs.taskId).toBeDefined();
    expect(attrs.startedAt).toBeDefined();
    expect(attrs.endedAt).toBeDefined();
    expect(attrs.durationMinutes).toBeDefined();
    expect(attrs.type).toBeDefined();
    expect(attrs.completed).toBeDefined();
    expect(attrs.createdAt).toBeDefined();
  });

  it('uses explicit snake_case field mappings', () => {
    const attrs = PomodoroSession.rawAttributes;

    expect(attrs.userId.field).toBe('user_id');
    expect(attrs.taskId.field).toBe('task_id');
    expect(attrs.startedAt.field).toBe('started_at');
    expect(attrs.endedAt.field).toBe('ended_at');
    expect(attrs.durationMinutes.field).toBe('duration_minutes');
    expect(attrs.createdAt.field).toBe('created_at');
  });

  it('sets defaults for type and completed', () => {
    const attrs = PomodoroSession.rawAttributes;

    expect(attrs.type.defaultValue).toBe('focus');
    expect(attrs.completed.defaultValue).toBe(false);
  });

  it('references users and tasks tables with the correct nullability', () => {
    const attrs = PomodoroSession.rawAttributes;

    expect(attrs.userId.allowNull).toBe(false);
    expect(attrs.userId.references.model).toBe('users');
    expect(attrs.taskId.allowNull).toBe(true);
    expect(attrs.taskId.references.model).toBe('tasks');
  });

  it('allows endedAt and durationMinutes to be null while active', () => {
    const attrs = PomodoroSession.rawAttributes;

    expect(attrs.endedAt.allowNull).toBe(true);
    expect(attrs.durationMinutes.allowNull).toBe(true);
  });
});
