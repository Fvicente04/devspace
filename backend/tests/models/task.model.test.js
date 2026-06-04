// Tests that the Task model has the correct fields and snake_case column mappings
const { Task } = require('../../src/models/task.model');

describe('Task model', () => {
  it('can be imported without throwing', () => {
    expect(Task).toBeDefined();
  });

  it('has the expected fields', () => {
    const attrs = Task.rawAttributes;
    expect(attrs.id).toBeDefined();
    expect(attrs.userId).toBeDefined();
    expect(attrs.title).toBeDefined();
    expect(attrs.description).toBeDefined();
    expect(attrs.status).toBeDefined();
    expect(attrs.githubIssueUrl).toBeDefined();
    expect(attrs.githubIssueNumber).toBeDefined();
    expect(attrs.githubRepo).toBeDefined();
    expect(attrs.createdAt).toBeDefined();
    expect(attrs.updatedAt).toBeDefined();
  });

  it('maps userId to user_id column', () => {
    expect(Task.rawAttributes.userId.field).toBe('user_id');
  });

  it('maps githubIssueUrl to github_issue_url column', () => {
    expect(Task.rawAttributes.githubIssueUrl.field).toBe('github_issue_url');
  });

  it('maps githubIssueNumber to github_issue_number column', () => {
    expect(Task.rawAttributes.githubIssueNumber.field).toBe('github_issue_number');
  });

  it('maps githubRepo to github_repo column', () => {
    expect(Task.rawAttributes.githubRepo.field).toBe('github_repo');
  });

  it('makes title not null', () => {
    expect(Task.rawAttributes.title.allowNull).toBe(false);
  });

  it('defaults status to todo', () => {
    expect(Task.rawAttributes.status.defaultValue).toBe('todo');
  });

  it('references users table via userId', () => {
    expect(Task.rawAttributes.userId.references).toBeDefined();
    expect(Task.rawAttributes.userId.references.model).toBe('users');
  });
});
