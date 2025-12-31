// Machine Learning Security Service for quantum-safe messenger
// In production, this would use TensorFlow.js or similar ML framework

export interface SecurityAlert {
  id: string;
  type: 'anomaly' | 'threat' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  confidence: number;
}

export interface MessageAnalysis {
  isAnomalous: boolean;
  threatLevel: number;
  patterns: string[];
  recommendations: string[];
}

class MLSecurityService {
  private static instance: MLSecurityService;
  private alerts: SecurityAlert[] = [];
  private messageHistory: string[] = [];

  static getInstance(): MLSecurityService {
    if (!MLSecurityService.instance) {
      MLSecurityService.instance = new MLSecurityService();
    }
    return MLSecurityService.instance;
  }

  // Analyze message for security threats
  async analyzeMessage(message: string, sender: string, recipient: string): Promise<MessageAnalysis> {
    try {
      // Add message to history for pattern analysis
      this.messageHistory.push(message);
      if (this.messageHistory.length > 100) {
        this.messageHistory.shift(); // Keep only last 100 messages
      }

      // Simulate ML analysis delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Simple pattern detection (in production, this would use trained ML models)
      const patterns = this.detectPatterns(message);
      const threatLevel = this.calculateThreatLevel(message, patterns);
      const isAnomalous = threatLevel > 0.7;

      // Generate recommendations
      const recommendations = this.generateRecommendations(threatLevel, patterns);

      // Create alert if threat level is high
      if (threatLevel > 0.8) {
        this.createAlert('threat', threatLevel > 0.9 ? 'critical' : 'high',
          `High threat message detected from ${sender}`, threatLevel);
      } else if (isAnomalous) {
        this.createAlert('anomaly', 'medium',
          `Anomalous message pattern detected`, threatLevel);
      }

      return {
        isAnomalous,
        threatLevel,
        patterns,
        recommendations
      };

    } catch (error) {
      console.error('Message analysis failed:', error);
      return {
        isAnomalous: false,
        threatLevel: 0,
        patterns: [],
        recommendations: ['Analysis failed - proceed with caution']
      };
    }
  }

  // Detect suspicious patterns in message
  private detectPatterns(message: string): string[] {
    const patterns: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Common suspicious patterns
    if (lowerMessage.includes('password') || lowerMessage.includes('credentials')) {
      patterns.push('credential_sharing');
    }

    if (lowerMessage.includes('bitcoin') || lowerMessage.includes('wallet') || lowerMessage.includes('crypto')) {
      patterns.push('financial_discussion');
    }

    if (lowerMessage.includes('hack') || lowerMessage.includes('exploit') || lowerMessage.includes('vulnerability')) {
      patterns.push('security_discussion');
    }

    if (message.length > 1000) {
      patterns.push('unusually_long_message');
    }

    if (/(.)\1{4,}/.test(message)) { // Repeated characters
      patterns.push('repeated_characters');
    }

    if (/[A-Z]{5,}/.test(message)) { // Excessive caps
      patterns.push('excessive_capitalization');
    }

    // Check for unusual character combinations
    const specialChars = (message.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialChars / message.length > 0.3) {
      patterns.push('high_special_characters');
    }

    return patterns;
  }

  // Calculate threat level based on patterns and message characteristics
  private calculateThreatLevel(message: string, patterns: string[]): number {
    let threatLevel = 0;

    // Base threat from patterns
    const patternWeights: { [key: string]: number } = {
      'credential_sharing': 0.9,
      'financial_discussion': 0.6,
      'security_discussion': 0.7,
      'unusually_long_message': 0.4,
      'repeated_characters': 0.3,
      'excessive_capitalization': 0.2,
      'high_special_characters': 0.5
    };

    patterns.forEach(pattern => {
      threatLevel += patternWeights[pattern] || 0.1;
    });

    // Adjust based on message history patterns
    const historyAnomaly = this.analyzeHistoryPatterns(message);
    threatLevel += historyAnomaly * 0.3;

    // Normalize to 0-1 range
    return Math.min(threatLevel, 1);
  }

  // Analyze message against historical patterns
  private analyzeHistoryPatterns(message: string): number {
    if (this.messageHistory.length < 5) return 0;

    const recentMessages = this.messageHistory.slice(-10);
    const avgLength = recentMessages.reduce((sum, msg) => sum + msg.length, 0) / recentMessages.length;
    const lengthDeviation = Math.abs(message.length - avgLength) / avgLength;

    // High deviation from normal message length
    if (lengthDeviation > 0.5) return 0.3;

    // Check for repetitive content
    const uniqueWords = new Set(message.toLowerCase().split(/\s+/));
    const uniquenessRatio = uniqueWords.size / message.split(/\s+/).length;

    if (uniquenessRatio < 0.3) return 0.4; // Very repetitive

    return 0;
  }

  // Generate security recommendations
  private generateRecommendations(threatLevel: number, patterns: string[]): string[] {
    const recommendations: string[] = [];

    if (threatLevel > 0.8) {
      recommendations.push('🚨 CRITICAL: Do not proceed with this communication');
      recommendations.push('Report this message to security team immediately');
    } else if (threatLevel > 0.6) {
      recommendations.push('⚠️ HIGH RISK: Verify sender identity before responding');
      recommendations.push('Consider using additional verification methods');
    } else if (threatLevel > 0.4) {
      recommendations.push('⚡ MEDIUM RISK: Review message content carefully');
    }

    if (patterns.includes('credential_sharing')) {
      recommendations.push('Never share credentials through messaging');
      recommendations.push('Use secure password managers instead');
    }

    if (patterns.includes('financial_discussion')) {
      recommendations.push('Be cautious with financial information');
      recommendations.push('Verify all transaction details independently');
    }

    if (patterns.length === 0 && threatLevel < 0.3) {
      recommendations.push('✅ Message appears normal');
    }

    return recommendations;
  }

  // Create security alert
  private createAlert(type: 'anomaly' | 'threat' | 'suspicious_pattern',
                      severity: 'low' | 'medium' | 'high' | 'critical',
                      message: string, confidence: number): void {
    const alert: SecurityAlert = {
      id: 'alert_' + Date.now(),
      type,
      severity,
      message,
      timestamp: Date.now(),
      confidence
    };

    this.alerts.push(alert);
    console.warn('Security Alert:', alert);
  }

  // Get all security alerts
  getAlerts(): SecurityAlert[] {
    return this.alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get alerts by severity
  getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): SecurityAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  // Clear old alerts (keep only last 24 hours)
  clearOldAlerts(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneDayAgo);
  }

  // Get security statistics
  getSecurityStats(): {
    totalAlerts: number;
    alertsByType: { [key: string]: number };
    alertsBySeverity: { [key: string]: number };
    averageThreatLevel: number;
  } {
    const alertsByType: { [key: string]: number } = {};
    const alertsBySeverity: { [key: string]: number } = {};
    let totalThreatLevel = 0;

    this.alerts.forEach(alert => {
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
      totalThreatLevel += alert.confidence;
    });

    return {
      totalAlerts: this.alerts.length,
      alertsByType,
      alertsBySeverity,
      averageThreatLevel: this.alerts.length > 0 ? totalThreatLevel / this.alerts.length : 0
    };
  }
}

// Export singleton instance
export const mlSecurityService = MLSecurityService.getInstance();

// Utility functions
export const analyzeMessageSecurity = async (
  message: string,
  sender: string,
  recipient: string
): Promise<MessageAnalysis> => {
  return await mlSecurityService.analyzeMessage(message, sender, recipient);
};

export const getSecurityAlerts = (): SecurityAlert[] => {
  return mlSecurityService.getAlerts();
};

export const getSecurityStats = () => {
  return mlSecurityService.getSecurityStats();
};

export const clearSecurityAlerts = (): void => {
  mlSecurityService.clearOldAlerts();
};
