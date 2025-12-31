// AI-Powered Security Module for Quantum-Safe Messenger
// Features: Behavioral Biometrics, Anomaly Detection, Automated Threat Response

export interface UserProfile {
  userId: string;
  typingPatterns: TypingPattern[];
  deviceFingerprints: DeviceFingerprint[];
  behavioralBaseline: BehavioralBaseline;
  riskScore: number;
  lastActivity: number;
}

export interface TypingPattern {
  timestamp: number;
  keystrokeIntervals: number[];
  keyHoldTimes: number[];
  commonMistakes: string[];
  typingSpeed: number;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  hash: string;
}

export interface BehavioralBaseline {
  averageTypingSpeed: number;
  commonKeystrokeIntervals: number[];
  usualActivityHours: number[];
  messageFrequency: number;
  contentPatterns: string[];
}

export interface AnomalyAlert {
  userId: string;
  anomalyType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  details: any;
  timestamp: number;
}

export interface ThreatIntelligence {
  attackPatterns: AttackPattern[];
  emergingThreats: EmergingThreat[];
  riskAssessment: RiskAssessment;
  recommendations: string[];
}

export interface AttackPattern {
  pattern: string;
  frequency: number;
  severity: string;
  description: string;
  mitigation: string[];
}

export interface EmergingThreat {
  threat: string;
  indicators: string[];
  confidence: number;
  firstSeen: number;
}

export interface RiskAssessment {
  overallRisk: number;
  riskFactors: string[];
  riskTrends: number[];
  mitigationPriority: string[];
}

export class AISecurity {
  private static instance: AISecurity;
  private userProfiles: Map<string, UserProfile> = new Map();
  private anomalyAlerts: AnomalyAlert[] = [];
  private threatIntelligence: ThreatIntelligence;
  private mlModel: MLModel;

  static getInstance(): AISecurity {
    if (!AISecurity.instance) {
      AISecurity.instance = new AISecurity();
    }
    return AISecurity.instance;
  }

  constructor() {
    this.threatIntelligence = {
      attackPatterns: [],
      emergingThreats: [],
      riskAssessment: {
        overallRisk: 0,
        riskFactors: [],
        riskTrends: [],
        mitigationPriority: []
      },
      recommendations: []
    };

    this.mlModel = new MLModel();
  }

  // Analyze typing patterns for behavioral biometrics
  analyzeTypingPattern(
    userId: string,
    keystrokeData: { intervals: number[]; holdTimes: number[]; speed: number }
  ): { isAnomalous: boolean; confidence: number; riskScore: number } {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      // Create new profile for first-time user
      this.createUserProfile(userId, keystrokeData);
      return { isAnomalous: false, confidence: 0.5, riskScore: 0.1 };
    }

    // Update typing patterns
    const newPattern: TypingPattern = {
      timestamp: Date.now(),
      keystrokeIntervals: keystrokeData.intervals,
      keyHoldTimes: keystrokeData.holdTimes,
      commonMistakes: [], // Would be populated from actual typing data
      typingSpeed: keystrokeData.speed
    };

    profile.typingPatterns.push(newPattern);

    // Analyze against baseline
    const anomalyScore = this.calculateTypingAnomaly(profile, newPattern);
    const isAnomalous = anomalyScore > 0.7; // Threshold for anomaly
    const riskScore = this.calculateRiskScore(profile, anomalyScore);

    // Update risk score
    profile.riskScore = riskScore;
    profile.lastActivity = Date.now();

    // Generate alert if anomalous
    if (isAnomalous) {
      this.generateAnomalyAlert(userId, 'typing_anomaly', anomalyScore, {
        pattern: newPattern,
        baseline: profile.behavioralBaseline
      });
    }

    return { isAnomalous, confidence: anomalyScore, riskScore };
  }

  // Analyze device fingerprint for consistency
  analyzeDeviceFingerprint(userId: string, deviceData: Partial<DeviceFingerprint>): boolean {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      this.createUserProfile(userId, {}, deviceData);
      return true; // New device, assume legitimate
    }

    const fingerprint: DeviceFingerprint = {
      userAgent: deviceData.userAgent || '',
      screenResolution: deviceData.screenResolution || '',
      timezone: deviceData.timezone || '',
      language: deviceData.language || '',
      platform: deviceData.platform || '',
      cookieEnabled: deviceData.cookieEnabled || false,
      doNotTrack: deviceData.doNotTrack || false,
      hash: this.generateDeviceHash(deviceData)
    };

    // Check if device is known
    const knownDevice = profile.deviceFingerprints.find(df => df.hash === fingerprint.hash);

    if (!knownDevice) {
      // New device detected
      profile.deviceFingerprints.push(fingerprint);

      // Generate alert for new device
      this.generateAnomalyAlert(userId, 'new_device', 0.8, {
        newDevice: fingerprint,
        knownDevices: profile.deviceFingerprints.length
      });

      return false; // Suspicious new device
    }

    return true; // Known device
  }

  // Detect message content anomalies
  detectContentAnomaly(userId: string, message: string): { isAnomalous: boolean; riskLevel: string } {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return { isAnomalous: false, riskLevel: 'low' };
    }

    // Analyze message patterns
    const contentFeatures = this.extractContentFeatures(message);
    const anomalyScore = this.mlModel.predictAnomaly(contentFeatures, profile.behavioralBaseline);

    let riskLevel = 'low';
    if (anomalyScore > 0.8) riskLevel = 'critical';
    else if (anomalyScore > 0.6) riskLevel = 'high';
    else if (anomalyScore > 0.4) riskLevel = 'medium';

    if (anomalyScore > 0.5) {
      this.generateAnomalyAlert(userId, 'content_anomaly', anomalyScore, {
        message: this.hashString(message), // Don't store actual message
        features: contentFeatures
      });
    }

    return { isAnomalous: anomalyScore > 0.5, riskLevel };
  }

  // Automated threat response
  async executeAutomatedResponse(userId: string, threatType: string, severity: string): Promise<void> {
    const responses = {
      low: ['log_event'],
      medium: ['log_event', 'send_notification'],
      high: ['log_event', 'send_notification', 'require_reauth'],
      critical: ['log_event', 'send_notification', 'require_reauth', 'temporary_lockout']
    };

    const actions = responses[severity as keyof typeof responses] || responses.low;

    for (const action of actions) {
      await this.executeSecurityAction(userId, action, threatType);
    }
  }

  // Analyze attack patterns for threat intelligence
  analyzeAttackPatterns(): ThreatIntelligence {
    // Analyze recent alerts for patterns
    const recentAlerts = this.anomalyAlerts.filter(
      alert => Date.now() - alert.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    // Group by pattern
    const patternCounts = new Map<string, number>();
    recentAlerts.forEach(alert => {
      const count = patternCounts.get(alert.anomalyType) || 0;
      patternCounts.set(alert.anomalyType, count + 1);
    });

    // Update threat intelligence
    this.threatIntelligence.attackPatterns = Array.from(patternCounts.entries()).map(([pattern, frequency]) => ({
      pattern,
      frequency,
      severity: this.assessPatternSeverity(pattern, frequency),
      description: this.getPatternDescription(pattern),
      mitigation: this.getPatternMitigation(pattern)
    }));

    // Calculate overall risk
    this.threatIntelligence.riskAssessment.overallRisk = this.calculateOverallRisk(recentAlerts);
    this.threatIntelligence.riskAssessment.riskFactors = this.identifyRiskFactors(recentAlerts);

    // Generate recommendations
    this.threatIntelligence.recommendations = this.generateSecurityRecommendations();

    return this.threatIntelligence;
  }

  // Continuous learning and model updates
  async updateSecurityModel(): Promise<void> {
    // Collect training data from user profiles
    const trainingData = Array.from(this.userProfiles.values()).map(profile => ({
      features: this.extractProfileFeatures(profile),
      label: profile.riskScore < 0.3 ? 'normal' : 'suspicious'
    }));

    // Update ML model
    await this.mlModel.train(trainingData);

    // Update behavioral baselines
    this.updateBehavioralBaselines();
  }

  // Create user profile
  private createUserProfile(
    userId: string,
    typingData?: any,
    deviceData?: Partial<DeviceFingerprint>
  ): void {
    const profile: UserProfile = {
      userId,
      typingPatterns: typingData ? [this.createInitialTypingPattern(typingData)] : [],
      deviceFingerprints: deviceData ? [this.createDeviceFingerprint(deviceData)] : [],
      behavioralBaseline: this.createInitialBaseline(),
      riskScore: 0.1,
      lastActivity: Date.now()
    };

    this.userProfiles.set(userId, profile);
  }

  // Calculate typing anomaly score
  private calculateTypingAnomaly(profile: UserProfile, newPattern: TypingPattern): number {
    const baseline = profile.behavioralBaseline;

    // Compare typing speed
    const speedDiff = Math.abs(newPattern.typingSpeed - baseline.averageTypingSpeed) / baseline.averageTypingSpeed;

    // Compare keystroke intervals
    const intervalSimilarity = this.calculateIntervalSimilarity(
      newPattern.keystrokeIntervals,
      baseline.commonKeystrokeIntervals
    );

    // Calculate anomaly score (0-1, higher = more anomalous)
    const anomalyScore = (speedDiff * 0.4) + ((1 - intervalSimilarity) * 0.6);

    return Math.min(anomalyScore, 1);
  }

  // Calculate interval similarity using DTW-like algorithm
  private calculateIntervalSimilarity(intervals1: number[], intervals2: number[]): number {
    if (intervals1.length === 0 || intervals2.length === 0) return 0;

    const maxLength = Math.max(intervals1.length, intervals2.length);
    let similarity = 0;

    for (let i = 0; i < Math.min(intervals1.length, intervals2.length); i++) {
      const diff = Math.abs(intervals1[i] - intervals2[i]);
      const avg = (intervals1[i] + intervals2[i]) / 2;
      similarity += 1 - (diff / (avg + 1)); // Normalize difference
    }

    return similarity / maxLength;
  }

  // Calculate risk score
  private calculateRiskScore(profile: UserProfile, anomalyScore: number): number {
    const recencyWeight = Math.max(0, 1 - (Date.now() - profile.lastActivity) / (7 * 24 * 60 * 60 * 1000)); // 7 days
    const historyWeight = Math.min(profile.typingPatterns.length / 100, 1); // More history = more confidence

    return (anomalyScore * 0.7) + (profile.riskScore * 0.2) + (recencyWeight * 0.1);
  }

  // Generate anomaly alert
  private generateAnomalyAlert(
    userId: string,
    type: string,
    confidence: number,
    details: any
  ): void {
    const severity = confidence > 0.8 ? 'critical' :
                    confidence > 0.6 ? 'high' :
                    confidence > 0.4 ? 'medium' : 'low';

    const alert: AnomalyAlert = {
      userId,
      anomalyType: type,
      severity,
      confidence,
      details,
      timestamp: Date.now()
    };

    this.anomalyAlerts.push(alert);

    // Execute automated response
    this.executeAutomatedResponse(userId, type, severity);
  }

  // Execute security action
  private async executeSecurityAction(userId: string, action: string, threatType: string): Promise<void> {
    switch (action) {
      case 'log_event':
        console.log(`Security Event: ${threatType} for user ${userId}`);
        break;
      case 'send_notification':
        // Would integrate with notification system
        console.log(`Notification sent to user ${userId} about ${threatType}`);
        break;
      case 'require_reauth':
        // Would trigger re-authentication
        console.log(`Re-authentication required for user ${userId}`);
        break;
      case 'temporary_lockout':
        // Would temporarily lock account
        console.log(`Temporary lockout for user ${userId}`);
        break;
    }
  }

  // Extract content features for analysis
  private extractContentFeatures(message: string): any {
    return {
      length: message.length,
      wordCount: message.split(' ').length,
      uppercaseRatio: (message.match(/[A-Z]/g) || []).length / message.length,
      punctuationRatio: (message.match(/[.!?]/g) || []).length / message.length,
      numberRatio: (message.match(/\d/g) || []).length / message.length,
      emojiCount: (message.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length,
      urlCount: (message.match(/https?:\/\//g) || []).length
    };
  }

  // Assess pattern severity
  private assessPatternSeverity(pattern: string, frequency: number): string {
    const baseSeverity = {
      'typing_anomaly': 'medium',
      'new_device': 'high',
      'content_anomaly': 'high',
      'frequency_anomaly': 'medium'
    }[pattern] || 'low';

    // Increase severity with frequency
    if (frequency > 10) return 'critical';
    if (frequency > 5) return baseSeverity === 'low' ? 'medium' : 'high';
    return baseSeverity;
  }

  // Get pattern description
  private getPatternDescription(pattern: string): string {
    const descriptions = {
      'typing_anomaly': 'Unusual typing patterns detected',
      'new_device': 'Access from unrecognized device',
      'content_anomaly': 'Message content deviates from normal patterns',
      'frequency_anomaly': 'Abnormal message sending frequency'
    };
    return descriptions[pattern as keyof typeof descriptions] || 'Unknown anomaly pattern';
  }

  // Get pattern mitigation
  private getPatternMitigation(pattern: string): string[] {
    const mitigations = {
      'typing_anomaly': ['Require additional authentication', 'Monitor closely'],
      'new_device': ['Send device verification code', 'Review recent activity'],
      'content_anomaly': ['Flag message for review', 'Increase monitoring'],
      'frequency_anomaly': ['Implement rate limiting', 'Check for automated behavior']
    };
    return mitigations[pattern as keyof typeof mitigations] || ['Investigate manually'];
  }

  // Calculate overall risk
  private calculateOverallRisk(alerts: AnomalyAlert[]): number {
    if (alerts.length === 0) return 0;

    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalWeight = alerts.reduce((sum, alert) =>
      sum + severityWeights[alert.severity as keyof typeof severityWeights], 0);

    return Math.min(totalWeight / alerts.length / 4, 1);
  }

  // Identify risk factors
  private identifyRiskFactors(alerts: AnomalyAlert[]): string[] {
    const factors = new Set<string>();

    alerts.forEach(alert => {
      if (alert.anomalyType === 'new_device') factors.add('Multiple device access');
      if (alert.anomalyType === 'typing_anomaly') factors.add('Behavioral inconsistencies');
      if (alert.anomalyType === 'content_anomaly') factors.add('Content anomalies');
      if (alert.severity === 'critical') factors.add('High-severity alerts');
    });

    return Array.from(factors);
  }

  // Generate security recommendations
  private generateSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.threatIntelligence.riskAssessment.overallRisk > 0.7) {
      recommendations.push('Implement immediate security measures');
    }

    if (this.threatIntelligence.attackPatterns.some(p => p.pattern === 'new_device')) {
      recommendations.push('Review device management policies');
    }

    if (this.threatIntelligence.attackPatterns.some(p => p.pattern === 'content_anomaly')) {
      recommendations.push('Enhance content filtering');
    }

    recommendations.push('Continue monitoring and update security models regularly');

    return recommendations;
  }

  // Update behavioral baselines
  private updateBehavioralBaselines(): void {
    this.userProfiles.forEach(profile => {
      if (profile.typingPatterns.length > 10) {
        profile.behavioralBaseline = this.calculateBaseline(profile);
      }
    });
  }

  // Calculate behavioral baseline
  private calculateBaseline(profile: UserProfile): BehavioralBaseline {
    const patterns = profile.typingPatterns.slice(-50); // Last 50 patterns

    return {
      averageTypingSpeed: patterns.reduce((sum, p) => sum + p.typingSpeed, 0) / patterns.length,
      commonKeystrokeIntervals: this.calculateAverageIntervals(patterns),
      usualActivityHours: this.calculateActivityHours(patterns),
      messageFrequency: 0, // Would be calculated from message history
      contentPatterns: [] // Would be extracted from message content
    };
  }

  // Helper methods
  private createInitialTypingPattern(data: any): TypingPattern {
    return {
      timestamp: Date.now(),
      keystrokeIntervals: data.intervals || [],
      keyHoldTimes: data.holdTimes || [],
      commonMistakes: [],
      typingSpeed: data.speed || 0
    };
  }

  private createDeviceFingerprint(data: Partial<DeviceFingerprint>): DeviceFingerprint {
    return {
      userAgent: data.userAgent || '',
      screenResolution: data.screenResolution || '',
      timezone: data.timezone || '',
      language: data.language || '',
      platform: data.platform || '',
      cookieEnabled: data.cookieEnabled || false,
      doNotTrack: data.doNotTrack || false,
      hash: this.generateDeviceHash(data)
    };
  }

  private createInitialBaseline(): BehavioralBaseline {
    return {
      averageTypingSpeed: 0,
      commonKeystrokeIntervals: [],
      usualActivityHours: [],
      messageFrequency: 0,
      contentPatterns: []
    };
  }

  private calculateAverageIntervals(patterns: TypingPattern[]): number[] {
    if (patterns.length === 0) return [];

    const maxLength = Math.max(...patterns.map(p => p.keystrokeIntervals.length));
    const averages: number[] = [];

    for (let i = 0; i < maxLength; i++) {
      const values = patterns.map(p => p.keystrokeIntervals[i]).filter(v => v !== undefined);
      averages.push(values.reduce((sum, v) => sum + v, 0) / values.length);
    }

    return averages;
  }

  private calculateActivityHours(patterns: TypingPattern[]): number[] {
    const hours = patterns.map(p => new Date(p.timestamp).getHours());
    return [...new Set(hours)].sort((a, b) => a - b);
  }

  private extractProfileFeatures(profile: UserProfile): any {
    return {
      typingSpeed: profile.behavioralBaseline.averageTypingSpeed,
      patternCount: profile.typingPatterns.length,
      deviceCount: profile.deviceFingerprints.length,
      riskScore: profile.riskScore
    };
  }

  private generateDeviceHash(deviceData: Partial<DeviceFingerprint>): string {
    const dataString = JSON.stringify(deviceData);
    return this.hashString(dataString);
  }

  private hashString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

// Simplified ML Model for anomaly detection
class MLModel {
  private weights: any = {};
  private bias: number = 0;

  // Simple anomaly detection using statistical methods
  predictAnomaly(features: any, baseline: BehavioralBaseline): number {
    // Calculate deviation from baseline
    let anomalyScore = 0;
    let featureCount = 0;

    if (baseline.averageTypingSpeed > 0) {
      const speedDeviation = Math.abs(features.typingSpeed - baseline.averageTypingSpeed) / baseline.averageTypingSpeed;
      anomalyScore += speedDeviation;
      featureCount++;
    }

    // Add more feature comparisons as needed

    return featureCount > 0 ? anomalyScore / featureCount : 0;
  }

  // Train model (simplified)
  async train(trainingData: any[]): Promise<void> {
    // Simple averaging for baseline establishment
    if (trainingData.length > 0) {
      this.bias = trainingData.reduce((sum, item) => sum + (item.label === 'normal' ? 0 : 1), 0) / trainingData.length;
    }
  }
}

// Export utility functions
export const analyzeTypingPattern = (userId: string, keystrokeData: any) => {
  const ai = AISecurity.getInstance();
  return ai.analyzeTypingPattern(userId, keystrokeData);
};

export const analyzeDeviceFingerprint = (userId: string, deviceData: any) => {
  const ai = AISecurity.getInstance();
  return ai.analyzeDeviceFingerprint(userId, deviceData);
};

export const detectContentAnomaly = (userId: string, message: string) => {
  const ai = AISecurity.getInstance();
  return ai.detectContentAnomaly(userId, message);
};

export const getThreatIntelligence = () => {
  const ai = AISecurity.getInstance();
  return ai.analyzeAttackPatterns();
};

export const updateSecurityModel = async () => {
  const ai = AISecurity.getInstance();
  return await ai.updateSecurityModel();
};
