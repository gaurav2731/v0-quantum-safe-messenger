// Honeypot & Decoy Security Service
// Advanced layered security system to confuse and trap attackers

export interface HoneypotEvent {
  id: string;
  type: 'puzzle_failure' | 'fake_session' | 'honeytoken_access' | 'decoy_api' | 'crawler_trap';
  ip: string;
  userAgent: string;
  timestamp: number;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConfusionMetrics {
  totalTraps: number;
  puzzleFailures: number;
  fakeSessionsIssued: number;
  honeytokensAccessed: number;
  decoyAPICalls: number;
  crawlerTraps: number;
  attackerConfusionRate: number; // percentage of bots confused
  averageResponseTime: number; // how long bots spend in traps
}

class HoneypotService {
  private static instance: HoneypotService;
  private events: HoneypotEvent[] = [];
  private honeytokens: Set<string> = new Set();
  private decoyEndpoints: Map<string, string> = new Map();

  static getInstance(): HoneypotService {
    if (!HoneypotService.instance) {
      HoneypotService.instance = new HoneypotService();
    }
    return HoneypotService.instance;
  }

  constructor() {
    this.initializeHoneytokens();
    this.initializeDecoyEndpoints();
  }

  // Initialize fake environment variables (honeytokens)
  private initializeHoneytokens(): void {
    // Fake API keys that look real but are monitored
    this.honeytokens.add('sk-fake-openai-key-123456789');
    this.honeytokens.add('pk_test_stripe_fake_key_abcdef');
    this.honeytokens.add('aws_access_key_fake_id_12345');
    this.honeytokens.add('polygon_private_key_fake_67890');
    this.honeytokens.add('jwt_secret_fake_token_xyz');
  }

  // Initialize decoy API endpoints
  private initializeDecoyEndpoints(): void {
    this.decoyEndpoints.set('/api/admin', 'Admin panel - Access denied');
    this.decoyEndpoints.set('/api/config', 'Configuration endpoint - Unauthorized');
    this.decoyEndpoints.set('/api/debug', 'Debug mode - Disabled');
    this.decoyEndpoints.set('/api/logs', 'System logs - Classified');
    this.decoyEndpoints.set('/api/users', 'User management - Restricted');
  }

  // Check if accessed value is a honeytoken
  isHoneytoken(value: string): boolean {
    return this.honeytokens.has(value);
  }

  // Check if endpoint is a decoy
  isDecoyEndpoint(path: string): boolean {
    return this.decoyEndpoints.has(path);
  }

  // Get decoy response for endpoint
  getDecoyResponse(path: string): string {
    return this.decoyEndpoints.get(path) || 'Endpoint not found';
  }

  // Log honeypot event
  logEvent(type: HoneypotEvent['type'], details: any, severity: HoneypotEvent['severity'] = 'medium'): void {
    const event: HoneypotEvent = {
      id: 'hp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      ip: this.getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      timestamp: Date.now(),
      details,
      severity
    };

    this.events.push(event);
    console.warn('🚨 Honeypot Alert:', event);

    // In production, send to monitoring service
    this.sendToMonitoring(event);
  }

  // Generate fake session key for suspicious clients
  generateFakeSessionKey(): string {
    const fakeKey = 'fake_session_' + Math.random().toString(36).substr(2, 16);
    this.logEvent('fake_session', { sessionKey: fakeKey }, 'high');
    return fakeKey;
  }

  // Check if client behavior suggests bot/attacker
  isSuspiciousClient(userAgent: string, ip: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /python/i,
      /curl/i,
      /wget/i,
      /postman/i,
      /burp/i,
      /sqlmap/i,
      /nmap/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Get confusion metrics
  getConfusionMetrics(): ConfusionMetrics {
    const recentEvents = this.events.filter(e => e.timestamp > Date.now() - (24 * 60 * 60 * 1000)); // Last 24 hours

    const metrics: ConfusionMetrics = {
      totalTraps: recentEvents.length,
      puzzleFailures: recentEvents.filter(e => e.type === 'puzzle_failure').length,
      fakeSessionsIssued: recentEvents.filter(e => e.type === 'fake_session').length,
      honeytokensAccessed: recentEvents.filter(e => e.type === 'honeytoken_access').length,
      decoyAPICalls: recentEvents.filter(e => e.type === 'decoy_api').length,
      crawlerTraps: recentEvents.filter(e => e.type === 'crawler_trap').length,
      attackerConfusionRate: 0,
      averageResponseTime: 0
    };

    // Calculate confusion rate (percentage of events that are traps)
    if (metrics.totalTraps > 0) {
      metrics.attackerConfusionRate = (metrics.totalTraps / (metrics.totalTraps + 100)) * 100; // Assuming 100 legitimate events
    }

    // Calculate average time spent in traps (simplified)
    if (recentEvents.length > 0) {
      const totalTime = recentEvents.reduce((sum, e) => sum + (Date.now() - e.timestamp), 0);
      metrics.averageResponseTime = totalTime / recentEvents.length / 1000; // in seconds
    }

    return metrics;
  }

  // Get all honeypot events
  getEvents(): HoneypotEvent[] {
    return this.events.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Clear old events (keep last 7 days)
  clearOldEvents(): void {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp > weekAgo);
  }

  // Get client IP (simplified - in production use proper IP detection)
  private getClientIP(): string {
    // This is a placeholder - in production, get from request headers
    return '127.0.0.1';
  }

  // Send event to monitoring service (placeholder)
  private sendToMonitoring(event: HoneypotEvent): void {
    // In production, send to logging service, SIEM, etc.
    console.log('📊 Event sent to monitoring:', event.id);
  }

  // Generate decoy sitemap with loopback links
  generateDecoySitemap(): string {
    const decoyUrls = [
      '/admin-panel',
      '/config-backup',
      '/debug-console',
      '/system-logs',
      '/user-database',
      '/api-keys',
      '/private-docs',
      '/backup-files'
    ];

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    decoyUrls.forEach(url => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>https://your-domain.com${url}</loc>\n`;
      sitemap += '    <lastmod>2024-01-01</lastmod>\n';
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
  }
}

// Export singleton instance
export const honeypotService = HoneypotService.getInstance();

// Utility functions
export const logPuzzleFailure = (details: any) => {
  honeypotService.logEvent('puzzle_failure', details, 'low');
};

export const logHoneytokenAccess = (token: string) => {
  honeypotService.logEvent('honeytoken_access', { token }, 'high');
};

export const logDecoyAPIAccess = (endpoint: string) => {
  honeypotService.logEvent('decoy_api', { endpoint }, 'medium');
};

export const logCrawlerTrap = (details: any) => {
  honeypotService.logEvent('crawler_trap', details, 'low');
};

export const isSuspiciousClient = (userAgent: string, ip: string) => {
  return honeypotService.isSuspiciousClient(userAgent, ip);
};

export const generateFakeSessionKey = () => {
  return honeypotService.generateFakeSessionKey();
};

export const getConfusionMetrics = () => {
  return honeypotService.getConfusionMetrics();
};

export const getHoneypotEvents = () => {
  return honeypotService.getEvents();
};

// Additional utility functions for admin dashboard
export const getHoneypotStats = () => {
  const metrics = honeypotService.getConfusionMetrics();
  return {
    totalEvents: metrics.totalTraps,
    puzzleFailures: metrics.puzzleFailures,
    decoyAccesses: metrics.decoyAPICalls,
    apiHoneypotHits: metrics.decoyAPICalls,
    fakeSessionsCreated: metrics.fakeSessionsIssued,
    suspiciousIPs: 0, // Would need IP tracking implementation
    blockedAttempts: metrics.crawlerTraps,
    confusionScore: Math.round(metrics.attackerConfusionRate)
  };
};

export const getRecentEvents = (limit: number = 10) => {
  return honeypotService.getEvents().slice(0, limit).map(event => ({
    id: event.id,
    type: event.type,
    ip: event.ip,
    userAgent: event.userAgent,
    timestamp: event.timestamp,
    severity: event.severity
  }));
};

export const logApiHoneypotAccess = (details: any) => {
  honeypotService.logEvent('decoy_api', details, 'medium');
};
