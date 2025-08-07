import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../web/app.js';
import { TestHelpers } from '../../helpers/TestHelpers.js';
import { UserFactory } from '../../factories/UserFactory.js';

describe('Authentication API Integration Tests', () => {
  let testUser;

  beforeAll(async () => {
    await TestHelpers.setupTestDatabase();
  });

  beforeEach(async () => {
    await TestHelpers.clearDatabase();
    testUser = await TestHelpers.createTestUser(UserFactory.create());
  });

  afterAll(async () => {
    await TestHelpers.teardownTestDatabase();
  });

  describe('POST /auth/register', () => {
    test('should register new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('firstName', 'John');
      expect(response.body.user).toHaveProperty('lastName', 'Doe');
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const createdUser = await TestHelpers.getUserByEmail('newuser@example.com');
      expect(createdUser).toBeDefined();
      expect(createdUser.verified).toBe(false); // Email not verified initially
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: 'Email is required'
        })
      );
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: 'Password is required'
        })
      );
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'securePassword123!'
        })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: 'Invalid email format'
        })
      );
    });

    test('should validate password strength', async () => {
      const weakPasswords = [
        'weak',           // Too short
        '12345678',       // No letters
        'password',       // No numbers/symbols
        'PASSWORD123'     // No lowercase
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password
          })
          .expect(400);

        expect(response.body.errors).toContainEqual(
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('Password must')
          })
        );
      }
    });

    test('should prevent duplicate email registration', async () => {
      const userData = {
        email: testUser.email,
        password: 'securePassword123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Email already registered');
    });

    test('should send verification email after registration', async () => {
      const mockEmailService = jest.spyOn(TestHelpers, 'mockEmailService');
      
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword123!'
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(mockEmailService).toHaveBeenCalledWith({
        to: 'newuser@example.com',
        subject: 'Verify your email',
        template: 'email-verification',
        data: expect.objectContaining({
          verificationToken: expect.any(String)
        })
      });
    });

    test('should create user with default tier', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword123!'
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const user = await TestHelpers.getUserByEmail('newuser@example.com');
      expect(user.tier_id).toBe(1); // Default to Basic tier
    });
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'password123' // Test user default password
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.token).toBeDefined();
    });

    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject login for unverified users', async () => {
      const unverifiedUser = await TestHelpers.createTestUser(
        UserFactory.create({
          email: 'unverified@example.com',
          verified: false
        })
      );

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: unverifiedUser.email,
          password: 'password123'
        })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Email not verified');
      expect(response.body).toHaveProperty('resendVerification', true);
    });

    test('should update last login timestamp', async () => {
      const beforeLogin = new Date();
      
      await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        })
        .expect(200);

      const updatedUser = await TestHelpers.getUserById(testUser.id);
      expect(new Date(updatedUser.last_login)).toBeInstanceOf(Date);
      expect(new Date(updatedUser.last_login)).toBeAfterOrEqualTo(beforeLogin);
    });

    test('should implement rate limiting for failed attempts', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      // Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/login')
          .send(loginData)
          .expect(401);
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many failed attempts');
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout authenticated user', async () => {
      const token = TestHelpers.generateAuthToken(testUser);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');

      // Token should be invalidated
      await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    test('should handle logout without token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });
  });

  describe('POST /auth/forgot-password', () => {
    test('should send password reset email for valid email', async () => {
      const mockEmailService = jest.spyOn(TestHelpers, 'mockEmailService');

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password reset email sent');

      expect(mockEmailService).toHaveBeenCalledWith({
        to: testUser.email,
        subject: 'Password Reset',
        template: 'password-reset',
        data: expect.objectContaining({
          resetToken: expect.any(String)
        })
      });
    });

    test('should not reveal non-existent email addresses', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      // Same response for security (don't reveal if email exists)
      expect(response.body.message).toContain('Password reset email sent');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: 'Invalid email format'
        })
      );
    });

    test('should implement rate limiting', async () => {
      // Make multiple requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/auth/forgot-password')
          .send({ email: testUser.email })
          .expect(200);
      }

      // Next request should be rate limited
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(429);

      expect(response.body.error).toContain('Too many password reset requests');
    });
  });

  describe('POST /auth/reset-password', () => {
    test('should reset password with valid token', async () => {
      const resetToken = TestHelpers.generateResetToken(testUser.id);
      await TestHelpers.saveResetToken(testUser.id, resetToken);

      const newPassword = 'newSecurePassword123!';

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password reset successfully');

      // Verify can login with new password
      await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        })
        .expect(200);
    });

    test('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newPassword123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid or expired reset token');
    });

    test('should reject expired reset token', async () => {
      const expiredToken = TestHelpers.generateResetToken(testUser.id, -3600); // Expired 1 hour ago
      await TestHelpers.saveResetToken(testUser.id, expiredToken);

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: expiredToken,
          password: 'newPassword123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid or expired reset token');
    });

    test('should validate new password strength', async () => {
      const resetToken = TestHelpers.generateResetToken(testUser.id);
      await TestHelpers.saveResetToken(testUser.id, resetToken);

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'weak'
        })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.stringContaining('Password must')
        })
      );
    });
  });

  describe('POST /auth/verify-email', () => {
    test('should verify email with valid token', async () => {
      const unverifiedUser = await TestHelpers.createTestUser(
        UserFactory.create({
          email: 'unverified@example.com',
          verified: false
        })
      );
      const verificationToken = TestHelpers.generateVerificationToken(unverifiedUser.id);
      await TestHelpers.saveVerificationToken(unverifiedUser.id, verificationToken);

      const response = await request(app)
        .post('/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Email verified successfully');

      // Verify user is now verified
      const verifiedUser = await TestHelpers.getUserById(unverifiedUser.id);
      expect(verifiedUser.verified).toBe(true);
    });

    test('should reject invalid verification token', async () => {
      const response = await request(app)
        .post('/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid verification token');
    });

    test('should reject already verified users', async () => {
      const verificationToken = TestHelpers.generateVerificationToken(testUser.id);

      const response = await request(app)
        .post('/auth/verify-email')
        .send({ token: verificationToken })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already verified');
    });
  });

  describe('Google OAuth integration', () => {
    test('should handle Google OAuth callback', async () => {
      const mockGoogleUser = {
        id: 'google-123',
        email: 'google-user@example.com',
        given_name: 'Google',
        family_name: 'User',
        picture: 'https://example.com/avatar.jpg'
      };

      // Mock Google OAuth success
      jest.spyOn(TestHelpers, 'mockGoogleOAuth').mockResolvedValue(mockGoogleUser);

      const response = await request(app)
        .get('/auth/google/callback?code=valid-code')
        .expect(302); // Redirect after successful auth

      // Should redirect to dashboard
      expect(response.headers.location).toBe('/dashboard');

      // Verify user was created
      const user = await TestHelpers.getUserByEmail('google-user@example.com');
      expect(user).toBeDefined();
      expect(user.google_id).toBe('google-123');
      expect(user.verified).toBe(true); // Google users are pre-verified
    });

    test('should link Google account to existing user', async () => {
      const existingUser = await TestHelpers.createTestUser(
        UserFactory.create({ email: 'existing@example.com' })
      );

      const mockGoogleUser = {
        id: 'google-456',
        email: 'existing@example.com'
      };

      jest.spyOn(TestHelpers, 'mockGoogleOAuth').mockResolvedValue(mockGoogleUser);

      await request(app)
        .get('/auth/google/callback?code=valid-code')
        .expect(302);

      // Verify Google ID was added to existing user
      const updatedUser = await TestHelpers.getUserById(existingUser.id);
      expect(updatedUser.google_id).toBe('google-456');
    });
  });

  describe('error handling and security', () => {
    test('should handle database errors gracefully', async () => {
      jest.spyOn(TestHelpers, 'getDatabase').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });

    test('should prevent timing attacks on login', async () => {
      const startTime = Date.now();
      
      // Login with non-existent user
      await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      const nonExistentTime = Date.now() - startTime;

      const startTime2 = Date.now();
      
      // Login with existing user but wrong password
      await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      const wrongPasswordTime = Date.now() - startTime2;

      // Timing should be similar (within 100ms) to prevent user enumeration
      expect(Math.abs(nonExistentTime - wrongPasswordTime)).toBeLessThan(100);
    });

    test('should sanitize user input', async () => {
      const maliciousInput = '<script>alert("xss")</script>';

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securePassword123!',
          firstName: maliciousInput,
          lastName: maliciousInput
        })
        .expect(201);

      // Input should be sanitized
      expect(response.body.user.firstName).not.toContain('<script>');
      expect(response.body.user.lastName).not.toContain('<script>');
    });
  });
});
