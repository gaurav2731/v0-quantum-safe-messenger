// Admin Panel Service for Quantum-Safe Messenger
// User management, monitoring, and system administration

const dbService = require('../server/services/dbService');
const authService = require('../server/services/authService');
const honeypotService = require('../services/honeypotService');

class AdminPanelService {
  constructor() {
    this.adminUsers = new Set(); // Set of admin user IDs
  }

  // Initialize admin panel
  async initialize() {
    // Create default admin user if none exists
    const adminExists = await this.checkAdminExists();
    if (!adminExists) {
      await this.createDefaultAdmin();
    }
  }

  // Check if any admin users exist
  async checkAdminExists() {
    const query = "SELECT COUNT(*) as count FROM users WHERE email = 'admin@quantumsafe.com'";
    const result = await dbService.pool.query(query);
    return parseInt(result.rows[0].count) > 0;
  }

  // Create default admin user
  async createDefaultAdmin() {
    try {
      const adminData = {
        username: 'admin',
        email: 'admin@quantumsafe.com',
        password: 'Admin@123!',
        deviceId: 'admin-device-001',
        publicKey: 'admin-public-key-placeholder'
      };

      const user = await dbService.createUser(adminData);
      this.adminUsers.add(user.id);
      
      console.log('Default admin user created:', user.email);
    } catch (error) {
      console.error('Failed to create default admin:', error);
    }
  }

  // Authenticate admin user
  async authenticateAdmin(credentials) {
    const { email, password } = credentials;
    
    if (email !== 'admin@quantumsafe.com') {
      throw new Error('Invalid admin credentials');
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      throw new Error('Admin user not found');
    }

    const isValidPassword = await authService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate admin token
    const token = authService.generateAccessToken(user.id, user.device_id);
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    };
  }

  // Get all users (admin only)
  async getAllUsers(adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const query = `
      SELECT id, username, email, device_id, public_key, status, is_verified, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await dbService.pool.query(query);
    return result.rows;
  }

  // Get user by ID
  async getUserById(userId, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const user = await dbService.getUserById(userId);
    return user;
  }

  // Update user status
  async updateUserStatus(userId, status, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const validStatuses = ['online', 'offline', 'away', 'busy'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    await dbService.updateUserStatus(userId, status);
    
    return { success: true, message: `User status updated to ${status}` };
  }

  // Lock/unlock user account
  async toggleUserLock(userId, lock, reason, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const query = 'UPDATE users SET is_locked = $1, lock_reason = $2 WHERE id = $3';
    await dbService.pool.query(query, [lock, lock ? reason : null, userId]);
    
    const action = lock ? 'locked' : 'unlocked';
    return { success: true, message: `User account ${action}` };
  }

  // Delete user (soft delete)
  async deleteUser(userId, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    // Don't allow deleting admin users
    if (this.adminUsers.has(userId)) {
      throw new Error('Cannot delete admin user');
    }

    const query = 'UPDATE users SET deleted_at = NOW() WHERE id = $1';
    await dbService.pool.query(query, [userId]);
    
    return { success: true, message: 'User deleted successfully' };
  }

  // Get system statistics
  async getSystemStats(adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const stats = {};
    
    // Total users
    const userCount = await dbService.pool.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
    stats.totalUsers = parseInt(userCount.rows[0].count);
    
    // Active users (online in last 5 minutes)
    const activeUsers = await dbService.getActiveUsersCount();
    stats.activeUsers = activeUsers;
    
    // Total messages
    const messageCount = await dbService.pool.query('SELECT COUNT(*) as count FROM messages');
    stats.totalMessages = parseInt(messageCount.rows[0].count);
    
    // Messages in last 24 hours
    const recentMessages = await dbService.pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE created_at >= NOW() - INTERVAL \'24 hours\''
    );
    stats.messagesLast24Hours = parseInt(recentMessages.rows[0].count);
    
    // Security stats
    const securityStats = honeypotService.getThreatStats();
    stats.security = securityStats;
    
    // Blocked IPs
    const blockedIPs = honeypotService.getBlockedIPs();
    stats.blockedIPs = blockedIPs.length;
    
    return stats;
  }

  // Get security logs
  async getSecurityLogs(limit = 100, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const query = `
      SELECT sl.*, u.username, u.email
      FROM security_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ORDER BY sl.created_at DESC
      LIMIT $1
    `;
    const result = await dbService.pool.query(query, [limit]);
    return result.rows;
  }

  // Get threat analysis
  async getThreatAnalysis(adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const stats = honeypotService.getThreatStats();
    const blockedIPs = honeypotService.getBlockedIPs();
    
    return {
      threatStats: stats,
      blockedIPs: blockedIPs,
      honeypotActive: process.env.HONEYPOT_ENABLED === 'true'
    };
  }

  // Block IP address
  async blockIP(ipAddress, reason, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    honeypotService.blacklistIP(ipAddress, reason);
    
    return { success: true, message: `IP ${ipAddress} blocked` };
  }

  // Unblock IP address
  async unblockIP(ipAddress, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    honeypotService.unblockIP(ipAddress);
    
    return { success: true, message: `IP ${ipAddress} unblocked` };
  }

  // Get system health
  async getSystemHealth(adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const health = {
      database: 'unknown',
      server: 'unknown',
      websocket: 'unknown',
      security: 'unknown'
    };

    // Check database connection
    try {
      const dbHealth = await dbService.healthCheck();
      health.database = dbHealth.status;
    } catch (error) {
      health.database = 'unhealthy';
    }

    // Check server (this would be implemented in the main server)
    health.server = 'healthy'; // Assuming server is running if we can access this

    // Check WebSocket service
    try {
      // WebSocket service stats would be available in main server instance
      health.websocket = 'healthy'; // Assuming WebSocket is running
    } catch (error) {
      health.websocket = 'unhealthy';
    }

    // Check security service
    health.security = process.env.HONEYPOT_ENABLED === 'true' ? 'active' : 'inactive';

    return health;
  }

  // Get recent user activity
  async getUserActivity(limit = 50, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.status,
        u.last_login,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message
      FROM users u
      LEFT JOIN messages m ON u.id = m.sender_id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id, u.username, u.email, u.status, u.last_login
      ORDER BY u.last_login DESC NULLS LAST
      LIMIT $1
    `;
    const result = await dbService.pool.query(query, [limit]);
    return result.rows;
  }

  // Get chat analytics
  async getChatAnalytics(adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const analytics = {};
    
    // Total chats
    const chatCount = await dbService.pool.query('SELECT COUNT(*) as count FROM chats');
    analytics.totalChats = parseInt(chatCount.rows[0].count);
    
    // Messages per chat (average)
    const avgMessages = await dbService.pool.query(
      'SELECT AVG(message_count) as avg_messages FROM (SELECT COUNT(*) as message_count FROM messages GROUP BY chat_id) sub'
    );
    analytics.avgMessagesPerChat = parseFloat(avgMessages.rows[0].avg_messages || 0);
    
    // Most active chats
    const activeChats = await dbService.pool.query(`
      SELECT chat_id, COUNT(*) as message_count
      FROM messages
      GROUP BY chat_id
      ORDER BY message_count DESC
      LIMIT 10
    `);
    analytics.mostActiveChats = activeChats.rows;
    
    return analytics;
  }

  // Verify admin token
  async verifyAdminToken(token) {
    try {
      const decoded = await authService.verifyToken(token);
      const user = await dbService.getUserById(decoded.userId);
      
      if (!user || user.email !== 'admin@quantumsafe.com') {
        throw new Error('Unauthorized');
      }
      
      return true;
    } catch (error) {
      throw new Error('Invalid admin token');
    }
  }

  // Export user data (GDPR compliance)
  async exportUserData(userId, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const userData = {};
    
    // User basic info
    userData.user = await dbService.getUserById(userId);
    
    // User messages
    const messages = await dbService.pool.query(
      'SELECT * FROM messages WHERE sender_id = $1 ORDER BY created_at',
      [userId]
    );
    userData.messages = messages.rows;
    
    // User contacts
    userData.contacts = await dbService.getContacts(userId);
    
    // Security logs
    const securityLogs = await dbService.pool.query(
      'SELECT * FROM security_logs WHERE user_id = $1 ORDER BY created_at',
      [userId]
    );
    userData.securityLogs = securityLogs.rows;
    
    return userData;
  }

  // Cleanup old data
  async cleanupOldData(days = 30, adminToken) {
    await this.verifyAdminToken(adminToken);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Delete old security logs
    const securityLogsDeleted = await dbService.pool.query(
      'DELETE FROM security_logs WHERE created_at < $1',
      [cutoffDate]
    );
    
    // Delete old honeypot logs
    const honeypotLogsDeleted = await dbService.pool.query(
      'DELETE FROM honeypot_logs WHERE created_at < $1',
      [cutoffDate]
    );
    
    return {
      success: true,
      message: 'Old data cleaned up',
      deleted: {
        securityLogs: securityLogsDeleted.rowCount,
        honeypotLogs: honeypotLogsDeleted.rowCount
      }
    };
  }
}

module.exports = new AdminPanelService();