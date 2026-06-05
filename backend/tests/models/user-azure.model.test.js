// Tests that User model has the three Azure DevOps fields with correct snake_case mappings
jest.mock('../../src/config/database', () => ({
  sequelize: {
    define: jest.fn((name, fields) => ({ rawAttributes: fields })),
  },
}));

const { User } = require('../../src/models/user.model');

describe('User model — Azure DevOps fields', () => {
  it('has azureOrganization mapped to azure_organization (nullable)', () => {
    const field = User.rawAttributes.azureOrganization;
    expect(field).toBeDefined();
    expect(field.field).toBe('azure_organization');
    expect(field.allowNull).toBe(true);
  });

  it('has azurePatToken mapped to azure_pat_token (nullable)', () => {
    const field = User.rawAttributes.azurePatToken;
    expect(field).toBeDefined();
    expect(field.field).toBe('azure_pat_token');
    expect(field.allowNull).toBe(true);
  });

  it('has azureConnectedAt mapped to azure_connected_at (nullable)', () => {
    const field = User.rawAttributes.azureConnectedAt;
    expect(field).toBeDefined();
    expect(field.field).toBe('azure_connected_at');
    expect(field.allowNull).toBe(true);
  });
});
