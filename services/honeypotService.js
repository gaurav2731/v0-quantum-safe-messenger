// Honeypot Security Service for Quantum-Safe Messenger
// Detects and mitigates automated attacks and suspicious behavior

const dbService = require('../server/services/dbService');

class HoneypotService {
  constructor() {
    this.threatThreshold = parseInt(process.env.HONEYPOT_THRESHOLD) || 5;
    this.blockDuration = parseInt(process.env.HONEYPOT_BLOCK_DURATION) || 3600000; // 1 hour
    this.suspiciousIPs = new Map(); // ip -> { count, lastAttempt, blockedUntil }
    this.suspiciousPatterns = [
      // SQL Injection patterns
      /('|"|`)(\s|%20)*(union|select|insert|update|delete|drop|create|alter)(\s|%20)*.*\1/gi,
      /(\s|%20)(or|and)(\s|%20).*[=<>]/gi,
      /\/\*.*\*\//g,

      // XSS patterns
      /<script[^>]*>.*<\/script>/gi,
      /javascript:/gi,
      /on(load|error|click|mouseover|focus)=/gi,

      // Path traversal
      /\.\.\/|\.\.\\/g,

      // Command injection
      /(&&|\|\||;)(\s|%20)*(whoami|cat|ls|dir|echo|ping|curl|wget)/gi,

      // Admin panel probing
      /(admin|login|wp-admin|phpmyadmin|\.env)/gi
    ];

    this.decoyEndpoints = [
      '/admin',
      '/wp-admin',
      '/phpmyadmin',
      '/.env',
      '/config',
      '/database',
      '/backup',
      '/debug'
    ];
  }

  // Analyze incoming request for threats
  async analyzeRequest(req) {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const path = req.url;
    const method = req.method;
    const body = req.body || '';

    const threatData = {
      ipAddress,
      userAgent,
      path,
      method,
      body: typeof body === 'object' ? JSON.stringify(body) : body,
      timestamp: Date.now()
    };

    let threatLevel = 'low';
    let threatReasons = [];

    // Check for decoy endpoint access
    if (this.decoyEndpoints.some(endpoint => path.includes(endpoint))) {
      threatLevel = 'high';
      threatReasons.push('Access to decoy endpoint');
    }

    // Check for suspicious patterns
    const contentToCheck = `${path} ${method} ${userAgent} ${threatData.body}`;
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(contentToCheck)) {
        threatLevel = this.getHigherThreatLevel(threatLevel, 'medium');
        threatReasons.push(`Suspicious pattern detected: ${pattern}`);
      }
    }

    // Check for rapid requests (rate limiting)
    const requestHistory = this.getRequestHistory(ipAddress);
    if (requestHistory.length > 10) {
      const timeWindow = Date.now() - requestHistory[requestHistory.length - 10].timestamp;
      if (timeWindow < 60000) { // 10 requests in less than 1 minute
        threatLevel = this.getHigherThreatLevel(threatLevel, 'medium');
        threatReasons.push('High request frequency');
      }
    }

    // Check for automated tools (user agent analysis)
    if (this.isAutomatedTool(userAgent)) {
      threatLevel = this.getHigherThreatLevel(threatLevel, 'medium');
      threatReasons.push('Automated tool detected');
    }

    // Check for known malicious IP patterns
    if (this.isKnownMaliciousIP(ipAddress)) {
      threatLevel = 'critical';
      threatReasons.push('Known malicious IP address');
    }

    // Update threat tracking
    this.updateThreatTracking(ipAddress, threatLevel);

    // Log the security event
    await this.logThreat(threatData, threatLevel, threatReasons);

    // Take action based on threat level
    const action = this.determineAction(threatLevel, ipAddress);

    return {
      threatLevel,
      threatReasons,
      action,
      shouldBlock: action === 'block' || action === 'challenge'
    };
  }

  // Get client IP address
  getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection?.socket?.remoteAddress ?
        req.connection.socket.remoteAddress : '0.0.0.0');
  }

  // Get request history for an IP
  getRequestHistory(ipAddress) {
    if (!this.suspiciousIPs.has(ipAddress)) {
      this.suspiciousIPs.set(ipAddress, {
        requests: [],
        threatCount: 0,
        blockedUntil: null
      });
    }

    const ipData = this.suspiciousIPs.get(ipAddress);
    const oneHourAgo = Date.now() - 3600000;

    // Clean old requests
    ipData.requests = ipData.requests.filter(req => req.timestamp > oneHourAgo);

    return ipData.requests;
  }

  // Update threat tracking for an IP
  updateThreatTracking(ipAddress, threatLevel) {
    const ipData = this.suspiciousIPs.get(ipAddress) || {
      requests: [],
      threatCount: 0,
      blockedUntil: null
    };

    ipData.requests.push({
      timestamp: Date.now(),
      threatLevel
    });

    if (threatLevel !== 'low') {
      ipData.threatCount += 1;
    }

    // Auto-block if threat count exceeds threshold
    if (ipData.threatCount >= this.threatThreshold && !ipData.blockedUntil) {
      ipData.blockedUntil = Date.now() + this.blockDuration;
    }

    this.suspiciousIPs.set(ipAddress, ipData);
  }

  // Determine appropriate action for threat
  determineAction(threatLevel, ipAddress) {
    const ipData = this.suspiciousIPs.get(ipAddress);

    // Check if already blocked
    if (ipData && ipData.blockedUntil && Date.now() < ipData.blockedUntil) {
      return 'block';
    }

    switch (threatLevel) {
      case 'critical':
        return 'block';
      case 'high':
        return 'challenge'; // Could implement CAPTCHA
      case 'medium':
        return 'monitor';
      default:
        return 'allow';
    }
  }

  // Check if user agent indicates automated tool
  isAutomatedTool(userAgent) {
    const automatedIndicators = [
      'bot', 'crawler', 'spider', 'scanner', 'nmap', 'sqlmap',
      'burp', 'zap', 'nikto', 'nessus', 'acunetix', 'netsparker'
    ];

    const ua = userAgent.toLowerCase();
    return automatedIndicators.some(indicator => ua.includes(indicator));
  }

  // Check if IP is known malicious (placeholder - would integrate with threat intelligence)
  isKnownMaliciousIP(ipAddress) {
    // In production, integrate with services like:
    // - AbuseIPDB
    // - Emerging Threats
    // - Spamhaus
    // - Your own IP blacklist

    const knownMaliciousIPs = [
      // Example malicious IPs (in real implementation, this would be dynamic)
      '192.168.1.100', // Example
    ];

    return knownMaliciousIPs.includes(ipAddress);
  }

  // Get higher threat level
  getHigherThreatLevel(current, newLevel) {
    const levels = ['low', 'medium', 'high', 'critical'];
    return levels[Math.max(levels.indexOf(current), levels.indexOf(newLevel))];
  }

  // Log threat to database
  async logThreat(threatData, threatLevel, reasons) {
    try {
      await dbService.pool.query(
        `INSERT INTO honeypot_logs 
         (ip_address, user_agent, request_path, request_method, request_data, threat_level, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          threatData.ipAddress,
          threatData.userAgent,
          threatData.path,
          threatData.method,
          threatData.body,
          threatLevel
        ]
      );
    } catch (error) {
      console.error('Failed to log threat:', error);
    }
  }

  // Get threat statistics
  getThreatStats() {
    const stats = {
      totalIPs: this.suspiciousIPs.size,
      blockedIPs: 0,
      threatLevels: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }
    };

    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (data.blockedUntil && Date.now() < data.blockedUntil) {
        stats.blockedIPs++;
      }

      // Count highest threat level for each IP
      const maxThreat = data.requests.reduce((max, req) =>
        this.getHigherThreatLevel(max, req.threatLevel), 'low'
      );
      stats.threatLevels[maxThreat]++;
    }

    return stats;
  }

  // Get blocked IPs
  getBlockedIPs() {
    const blocked = [];
    const now = Date.now();

    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (data.blockedUntil && now < data.blockedUntil) {
        blocked.push({
          ip,
          blockedUntil: data.blockedUntil,
          threatCount: data.threatCount
        });
      }
    }

    return blocked;
  }

  // Unblock an IP (admin function)
  unblockIP(ipAddress) {
    if (this.suspiciousIPs.has(ipAddress)) {
      const ipData = this.suspiciousIPs.get(ipAddress);
      ipData.blockedUntil = null;
      this.suspiciousIPs.set(ipAddress, ipData);
    }
  }

  // Add IP to permanent blacklist
  blacklistIP(ipAddress, reason = 'Manual blacklist') {
    if (!this.suspiciousIPs.has(ipAddress)) {
      this.suspiciousIPs.set(ipAddress, {
        requests: [],
        threatCount: this.threatThreshold,
        blockedUntil: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
      });
    } else {
      const ipData = this.suspiciousIPs.get(ipAddress);
      ipData.blockedUntil = Date.now() + (365 * 24 * 60 * 60 * 1000);
      this.suspiciousIPs.set(ipAddress, ipData);
    }

    // Log to database
    this.logThreat({
      ipAddress,
      userAgent: 'SYSTEM',
      path: '/blacklist',
      method: 'POST',
      body: reason
    }, 'critical', ['Manually blacklisted']);
  }

  // Clean up old data
  cleanup() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    for (const [ip, data] of this.suspiciousIPs.entries()) {
      // Remove old requests
      data.requests = data.requests.filter(req => req.timestamp > oneDayAgo);

      // Remove IP data if no recent activity and not blocked
      if (data.requests.length === 0 &&
        (!data.blockedUntil || Date.now() > data.blockedUntil)) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }

  // Middleware for Express
  middleware() {
    return async (req, res, next) => {
      try {
        const analysis = await this.analyzeRequest(req);

        // Add threat analysis to request object
        req.threatAnalysis = analysis;

        if (analysis.shouldBlock) {
          // Log the blocked attempt
          console.warn(`Blocked request from ${this.getClientIP(req)}: ${analysis.threatLevel}`);

          // Return appropriate response based on action
          switch (analysis.action) {
            case 'block':
              return res.status(403).json({
                error: 'Access denied',
                message: 'Your request has been blocked for security reasons'
              });
            case 'challenge':
              // Would implement CAPTCHA challenge here
              return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Please try again later'
              });
            default:
              return res.status(400).json({
                error: 'Bad request',
                message: 'Invalid request format'
              });
          }
        }

        next();
      } catch (error) {
        console.error('Honeypot analysis error:', error);
        next(); // Don't block on analysis errors
      }
    };
  }
}

module.exports = new HoneypotService();