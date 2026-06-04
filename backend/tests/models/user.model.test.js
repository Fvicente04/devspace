// Tests that the User model has correct fields and snake_case column mappings
const { User } = require('../../src/models/user.model');

describe('User model', () => {
  it('can be imported without throwing', () => {
    expect(User).toBeDefined();
  });

  it('has all required fields', () => {
    const attrs = User.rawAttributes;
    expect(attrs.id).toBeDefined();
    expect(attrs.githubId).toBeDefined();
    expect(attrs.username).toBeDefined();
    expect(attrs.displayName).toBeDefined();
    expect(attrs.avatarUrl).toBeDefined();
    expect(attrs.githubToken).toBeDefined();
    expect(attrs.createdAt).toBeDefined();
    expect(attrs.updatedAt).toBeDefined();
  });

  it('maps githubId to github_id', () => {
    expect(User.rawAttributes.githubId.field).toBe('github_id');
  });

  it('maps displayName to display_name', () => {
    expect(User.rawAttributes.displayName.field).toBe('display_name');
  });

  it('maps avatarUrl to avatar_url', () => {
    expect(User.rawAttributes.avatarUrl.field).toBe('avatar_url');
  });

  it('maps githubToken to github_token', () => {
    expect(User.rawAttributes.githubToken.field).toBe('github_token');
  });

  it('maps createdAt to created_at', () => {
    expect(User.rawAttributes.createdAt.field).toBe('created_at');
  });

  it('maps updatedAt to updated_at', () => {
    expect(User.rawAttributes.updatedAt.field).toBe('updated_at');
  });

  it('makes githubId unique and not null', () => {
    const githubId = User.rawAttributes.githubId;
    expect(githubId.unique).toBe(true);
    expect(githubId.allowNull).toBe(false);
  });
});
