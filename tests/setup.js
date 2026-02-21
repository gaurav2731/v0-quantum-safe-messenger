// Test setup file
// Mock database connections for testing
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn()
    }),
    query: jest.fn().mockResolvedValue({ rows: [] }),
    on: jest.fn(),
    end: jest.fn().mockResolvedValue()
  };
  
  const Pool = jest.fn(() => mockPool);
  
  return { Client: Pool, Pool };
});

// Mock bcrypt for faster tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 1, username: 'testuser' })
}));

// Mock crypto for encryption tests
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mock-random-bytes')),
  createCipher: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue('encrypted'),
    final: jest.fn().mockReturnValue('')
  }),
  createDecipher: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue('decrypted'),
    final: jest.fn().mockReturnValue('')
  })
}));

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key';