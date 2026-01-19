import { describe, expect, it } from 'vitest';
import { loginSchema } from './validation';

describe('loginSchema', () => {
  describe('email validation', () => {
    it('should pass with valid email', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('should fail when email is empty', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Email is required');
      }
    });

    it('should fail with invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email address');
      }
    });
  });

  describe('password validation', () => {
    it('should pass with valid password (6+ characters)', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('should fail when password is too short', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must be at least 6 characters');
      }
    });

    it('should fail when password is empty', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
    });
  });
});
