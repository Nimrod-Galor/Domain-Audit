import { jest } from '@jest/globals';

// Mock dependencies before importing User
const mockQuery = jest.fn();
const mockTransaction = jest.fn();

jest.unstable_mockModule('../../web/models/database.js', () => ({
  query: mockQuery,
  transaction: mockTransaction
}));

// Mock bcryptjs (not bcrypt)
const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn()
};

jest.unstable_mockModule('bcryptjs', () => ({
  default: mockBcrypt
}));

// Mock crypto
const mockCrypto = {
  randomBytes: jest.fn()
};

jest.unstable_mockModule('crypto', () => ({
  default: mockCrypto
}));

const { User } = await import('../../web/models/User.js');

describe('User Model - Real Production Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail()', () => {
    test('should find user by email successfully', async () => {
      const testEmail = 'test@example.com';
      const mockUser = {
        id: 1,
        email: testEmail,
        username: 'testuser',
        password_hash: 'hashed_password',
        plan: 'freemium',
        email_verified: true,
        created_at: '2024-01-15T10:30:00.000Z'
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail(testEmail);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', [testEmail.toLowerCase()]);
      expect(result).toEqual(mockUser);
    });

    test('should return null for non-existent email', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    test('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      await expect(User.findByEmail('test@example.com')).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById()', () => {
    test('should find user by ID successfully', async () => {
      const testId = 1;
      const mockUser = {
        id: testId,
        email: 'test@example.com',
        username: 'testuser',
        plan: 'starter',
        email_verified: true
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(testId);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [testId]);
      expect(result).toEqual(mockUser);
    });

    test('should return null for non-existent ID', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await User.findById(999);

      expect(result).toBeNull();
    });

    test('should handle string ID as-is', async () => {
      const mockUser = { id: 5, email: 'test@example.com' };
      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById('5');

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['5']);
      expect(result).toEqual(mockUser);
    });
  });

  describe('create()', () => {
    test('should create new user with password hashing', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'plainPassword123',
        firstName: 'John',
        lastName: 'Doe',
        plan: 'starter'
      };

      const hashedPassword = 'hashedPassword123';
      mockBcrypt.hash.mockResolvedValue(hashedPassword);
      
      const mockNewUser = {
        id: 10,
        email: 'newuser@example.com',
        first_name: 'John',
        last_name: 'Doe',
        plan: 'starter',
        created_at: '2024-01-15T10:30:00.000Z',
        email_verified: false
      };
      
      mockQuery.mockResolvedValue({ rows: [mockNewUser] });

      const result = await User.create(userData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('plainPassword123', 12);
      expect(mockQuery).toHaveBeenCalledWith(
        `INSERT INTO users (email, password_hash, first_name, last_name, plan) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, first_name, last_name, plan, created_at, email_verified`,
        ['newuser@example.com', hashedPassword, 'John', 'Doe', 'starter']
      );
      expect(result).toEqual(mockNewUser);
    });

    test('should create user with default plan when not specified', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe'
      };

      mockBcrypt.hash.mockResolvedValue('hashed');
      const mockNewUser = { id: 15, email: 'user@example.com', plan: 'free' };
      mockQuery.mockResolvedValue({ rows: [mockNewUser] });

      await User.create(userData);

      const callArgs = mockQuery.mock.calls[0][1];
      expect(callArgs[4]).toBe('free'); // default plan
    });

    test('should create user without password hash for OAuth', async () => {
      const userData = {
        email: 'oauth@example.com',
        firstName: 'OAuth',
        lastName: 'User',
        plan: 'starter'
      };

      const mockNewUser = { id: 20, email: 'oauth@example.com' };
      mockQuery.mockResolvedValue({ rows: [mockNewUser] });

      await User.create(userData);

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      const callArgs = mockQuery.mock.calls[0][1];
      expect(callArgs[1]).toBeNull(); // password_hash should be null
    });

    test('should handle bcrypt hashing errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      mockBcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(User.create(userData)).rejects.toThrow('Hashing failed');
    });
  });

  describe('updateLastLogin()', () => {
    test('should update last login timestamp', async () => {
      const userId = 1;
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await User.updateLastLogin(userId);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      expect(result).toBe(true);
    });

    test('should return true regardless (no error checking)', async () => {
      // Based on the real function, it always returns true unless there's an error
      mockQuery.mockResolvedValue({ rowCount: 0 });

      const result = await User.updateLastLogin(999);

      expect(result).toBe(true);
    });
  });
});
