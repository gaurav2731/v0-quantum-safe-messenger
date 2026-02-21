const request = require('supertest');
const { app, server } = require('../server/server');

describe('Authentication API', () => {
  let testServer;
  
  beforeAll(() => {
    testServer = server;
  });

  afterAll(async () => {
    if (testServer) {
      await new Promise(resolve => testServer.close(resolve));
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser123',
        email: 'test123@example.com',
        password: 'SecurePass123!',
        deviceId: 'test-device-123',
        publicKey: 'test-public-key-123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should fail registration with duplicate email', async () => {
      const userData = {
        username: 'testuser456',
        email: 'test123@example.com', // Same email as previous test
        password: 'SecurePass123!',
        deviceId: 'test-device-456',
        publicKey: 'test-public-key-456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail registration with weak password', async () => {
      const userData = {
        username: 'testuser789',
        email: 'test789@example.com',
        password: '123', // Weak password
        deviceId: 'test-device-789',
        publicKey: 'test-public-key-789'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test123@example.com',
        password: 'SecurePass123!',
        deviceId: 'test-device-login'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
    });

    it('should fail login with wrong password', async () => {
      const loginData = {
        email: 'test123@example.com',
        password: 'WrongPassword123!',
        deviceId: 'test-device-wrong'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail login with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'AnyPassword123!',
        deviceId: 'test-device-nonexistent'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeAll(async () => {
      // Get refresh token from login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test123@example.com',
          password: 'SecurePass123!',
          deviceId: 'test-device-refresh'
        });
      
      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});