// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Increase test timeout
jest.setTimeout(30000);

// Add custom jest matchers
expect.extend({
  toBeBefore(received, other) {
    const pass = new Date(received) < new Date(other);
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be before ${other}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be before ${other}`,
        pass: false,
      };
    }
  },
});
