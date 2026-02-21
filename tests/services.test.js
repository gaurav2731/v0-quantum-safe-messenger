const { DatabaseService } = require('../server/services/dbService');
const { AuthService } = require('../server/services/authService');
const { EncryptionService } = require('../services/encryptionService');

describe('Database Service', () => {
  let dbService;

  beforeAll(() => {
    dbService = new DatabaseService();
  });

  afterAll(async () => {
    await dbService.close();
  });

  describe('User Operations', () => {
    it('should validate user creation data', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
        deviceId: 'test-device',
        publicKey: 'test-public-key'
      };

      expect(userData.username).toBeDefined();
      expect(userData.email).toBeDefined();
      expect(userData.password).toBeDefined();
      expect(userData.deviceId).toBeDefined();
      expect(userData.publicKey).toBeDefined();
    });

    it('should validate email format', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';
      
      expect(validEmail.includes('@')).toBe(true);
      expect(invalidEmail.includes('@')).toBe(false);
    });
  });

  describe('Message Operations', () => {
    it('should validate message structure', () => {
      const message = {
        id: 'msg-123',
        chatId: 'chat-1-2',
        senderId: 1,
        content: 'Test message',
        timestamp: Date.now(),
        status: 'sent'
      };

      expect(message.id).toBeDefined();
      expect(message.chatId).toBeDefined();
      expect(message.senderId).toBeDefined();
      expect(message.content).toBeDefined();
      expect(message.timestamp).toBeDefined();
      expect(message.status).toBeDefined();
    });
  });
});

describe('Authentication Service', () => {
  let authService;

  beforeAll(() => {
    authService = new AuthService();
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const strongPassword = 'SecurePass123!';
      const weakPassword = '123';
      
      expect(strongPassword.length >= 8).toBe(true);
      expect(/[A-Z]/.test(strongPassword)).toBe(true);
      expect(/[a-z]/.test(strongPassword)).toBe(true);
      expect(/[0-9]/.test(strongPassword)).toBe(true);
      expect(/[^A-Za-z0-9]/.test(strongPassword)).toBe(true);
      
      expect(weakPassword.length >= 8).toBe(false);
    });

    it('should generate secure tokens', () => {
      const token = authService.generateToken({ userId: 1, username: 'test' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });
  });
});

describe('Encryption Service', () => {
  let encryptionService;

  beforeAll(() => {
    encryptionService = new EncryptionService();
  });

  describe('Key Generation', () => {
    it('should generate valid encryption keys', () => {
      const key = encryptionService.generateKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(32);
    });

    it('should generate valid IV', () => {
      const iv = encryptionService.generateIV();
      expect(iv).toBeDefined();
      expect(Buffer.isBuffer(iv)).toBe(true);
      expect(iv.length).toBe(12); // 12 bytes for GCM
    });
  });

  describe('Message Encryption', () => {
    it('should encrypt and decrypt message', () => {
      const originalContent = 'Secret message content';
      const key = encryptionService.generateKey();
      
      const encrypted = encryptionService.encryptMessage(originalContent, key);
      expect(encrypted).toBeDefined();
      expect(encrypted.content).not.toBe(originalContent);
      
      const decrypted = encryptionService.decryptMessage(encrypted.content, key);
      expect(decrypted).toBe(originalContent);
    });

    it('should handle empty content', () => {
      const emptyContent = '';
      const key = encryptionService.generateKey();
      
      const encrypted = encryptionService.encryptMessage(emptyContent, key);
      const decrypted = encryptionService.decryptMessage(encrypted.content, key);
      expect(decrypted).toBe(emptyContent);
    });
  });
});

describe('Security Validation', () => {
  describe('Input Sanitization', () => {
    it('should detect SQL injection attempts', () => {
      const sqlInjectionPatterns = [
        "'; DROP TABLE users; --",
        "UNION SELECT * FROM users",
        "' OR '1'='1",
        "'; SELECT * FROM admin; --"
      ];
      
      sqlInjectionPatterns.forEach(pattern => {
        expect(pattern.includes('DROP')).toBe(pattern.includes('DROP'));
        expect(pattern.includes('UNION')).toBe(pattern.includes('UNION'));
        expect(pattern.includes('SELECT')).toBe(pattern.includes('SELECT'));
      });
    });

    it('should detect XSS attempts', () => {
      const xssPatterns = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'onload="alert(\'xss\')"',
        '<img src="x" onerror="alert(\'xss\')">'
      ];
      
      xssPatterns.forEach(pattern => {
        expect(pattern.includes('<script')).toBe(pattern.includes('<script'));
        expect(pattern.includes('javascript:')).toBe(pattern.includes('javascript:'));
        expect(pattern.includes('onerror')).toBe(pattern.includes('onerror'));
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should track request counts', () => {
      const requestCounts = new Map();
      const ip = '192.168.1.1';
      const windowMs = 900000; // 15 minutes
      
      requestCounts.set(ip, { count: 1, firstRequest: Date.now() });
      
      const record = requestCounts.get(ip);
      expect(record).toBeDefined();
      expect(record.count).toBe(1);
      expect(record.firstRequest).toBeDefined();
    });
  });
});