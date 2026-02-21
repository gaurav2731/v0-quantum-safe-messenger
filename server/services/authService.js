const jwt = require('jsonwebtoken');
const dbService = require('./dbService');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'quantum-safe-messenger-secret-key-2024';
    this.JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';
    this.REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';
  }

  // Generate JWT token
  generateToken(userId, deviceId) {
    return jwt.sign(
      {
        userId,
        deviceId,
        type: 'access'
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRE }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId, deviceId) {
    return jwt.sign(
      {
        userId,
        deviceId,
        type: 'refresh'
      },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRE }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Register new user
  async register(userData) {
    const { username, email, password, deviceId, publicKey } = userData;

    // Check if user already exists
    const existingByEmail = await dbService.findUserByEmail(email);
    const existingByUsername = await dbService.findUserByUsername(username);

    if (existingByEmail) throw new Error('Email already registered');
    if (existingByUsername) throw new Error('Username already taken');

    // Create new user
    const user = await dbService.createUser({
      username,
      email,
      password,
      deviceId,
      publicKey
    });

    // Generate tokens
    const token = this.generateToken(user.id, deviceId);
    const refreshToken = this.generateRefreshToken(user.id, deviceId);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status
      },
      token,
      refreshToken
    };
  }

  // Login user
  async login(credentials) {
    const { email, password, deviceId } = credentials;

    // Find user by email
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update user status and last seen
    await dbService.updateUserStatus(user.id, 'online');

    // Generate tokens
    const token = this.generateToken(user.id, deviceId);
    const refreshToken = this.generateRefreshToken(user.id, deviceId);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: 'online',
        publicKey: user.publicKey
      },
      token,
      refreshToken
    };
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET);

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Verify user still exists
      const user = await dbService.findUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newToken = this.generateToken(user.id, decoded.deviceId);
      const newRefreshToken = this.generateRefreshToken(user.id, decoded.deviceId);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Authenticate WebSocket connection
  async authenticateWebSocket(token, deviceId) {
    try {
      const decoded = this.verifyToken(token);

      if (decoded.deviceId !== deviceId) {
        throw new Error('Device ID mismatch');
      }

      const user = await dbService.findUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user status
      await dbService.updateUserStatus(user.id, 'online');

      return {
        userId: user.id,
        username: user.username,
        deviceId: user.device_id,
        publicKey: user.public_key
      };

    } catch (error) {
      throw new Error('WebSocket authentication failed: ' + error.message);
    }
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await dbService.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Remove sensitive info
    if (user.password_hash) delete user.password_hash;
    return user;
  }

  // Update user status
  async updateUserStatus(userId, status) {
    await dbService.updateUserStatus(userId, status);
    return { id: userId, status };
  }

  // Logout user
  async logout(userId) {
    await dbService.updateUserStatus(userId, 'offline');
  }

  // Validate token middleware
  validateToken(token) {
    try {
      const decoded = this.verifyToken(token);
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthService();

