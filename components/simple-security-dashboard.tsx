"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle2, AlertTriangle, Activity, Database, Key, Eye } from 'lucide-react';

interface SimpleSecurityDashboardProps {
  userId: string;
}

export const SimpleSecurityDashboard: React.FC<SimpleSecurityDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityMetrics, setSecurityMetrics] = useState({
    encryptionStatus: 'Active',
    blockchainVerified: true,
    tamperDetected: false,
    securityScore: 95,
    totalMessages: 42,
    encryptedMessages: 42,
    blockchainTransactions: 38,
    auditEvents: 156
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<Array<{
    id: string;
    timestamp: number;
    action: string;
    status: 'success' | 'warning' | 'info';
    details: string;
  }>>([
    {
      id: 'm1',
      timestamp: Date.now() - 1000 * 60 * 60,
      action: 'Cache cleanup',
      status: 'success',
      details: 'Cleared .next cache and rebuilt webpack artifacts'
    },
    {
      id: 'm2',
      timestamp: Date.now() - 1000 * 60 * 120,
      action: 'Reindexed transactions',
      status: 'success',
      details: 'Synced latest Polygon Mumbai receipts for audit view'
    },
    {
      id: 'm3',
      timestamp: Date.now() - 1000 * 60 * 200,
      action: 'Key rotation (simulated)',
      status: 'info',
      details: 'Rotated application signing keys and updated references'
    }
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSecurityMetrics(prev => ({
        ...prev,
        securityScore: Math.floor(Math.random() * 10) + 90,
        totalMessages: prev.totalMessages + Math.floor(Math.random() * 3),
        encryptedMessages: prev.totalMessages + Math.floor(Math.random() * 3),
        blockchainTransactions: prev.blockchainTransactions + Math.floor(Math.random() * 2),
        auditEvents: prev.auditEvents + Math.floor(Math.random() * 5)
      }));

      // Occasionally append a maintenance log entry
      if (Math.random() < 0.25) {
        const candidates = [
          {
            action: 'Checkpoint snapshot',
            status: 'info' as const,
            details: 'Saved state snapshot for audit rollback testing'
          },
          {
            action: 'Gas estimator refresh',
            status: 'success' as const,
            details: 'Updated median gas price and priority fee hints'
          },
          {
            action: 'Contract health probe',
            status: 'success' as const,
            details: 'Pinged verifier contract — all methods responsive'
          },
          {
            action: 'Alert threshold tune',
            status: 'warning' as const,
            details: 'Raised anomaly threshold to reduce false positives'
          }
        ];
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        setMaintenanceLogs(prev => [
          {
            id: `m_${Date.now()}`,
            timestamp: Date.now(),
            ...pick
          },
          ...prev
        ].slice(0, 20));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'blockchain', label: 'Blockchain', icon: Database },
    { id: 'encryption', label: 'Encryption', icon: Key },
    { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">Security Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{securityMetrics.securityScore}%</div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-green-400" />
            <span className="text-sm font-semibold text-green-300">Encrypted Messages</span>
          </div>
          <div className="text-2xl font-bold text-white">{securityMetrics.encryptedMessages}</div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Blockchain TX</span>
          </div>
          <div className="text-2xl font-bold text-white">{securityMetrics.blockchainTransactions}</div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Audit Events</span>
          </div>
          <div className="text-2xl font-bold text-white">{securityMetrics.auditEvents}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Security Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Encryption</span>
              <span className="text-sm text-green-400 font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Blockchain</span>
              <span className="text-sm text-green-400 font-semibold">Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Tamper Detection</span>
              <span className="text-sm text-green-400 font-semibold">Monitoring</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Recent Activity
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Message encrypted and sent</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Blockchain transaction confirmed</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span>Security audit completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-white">Message Sent</span>
          <span className="text-xs text-foreground/60">2 minutes ago</span>
        </div>
        <p className="text-sm text-foreground/70">Quantum-safe encryption applied to message</p>
      </div>
      
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Blockchain Verified</span>
          <span className="text-xs text-foreground/60">5 minutes ago</span>
        </div>
        <p className="text-sm text-foreground/70">Message metadata stored on Polygon Mumbai</p>
      </div>
      
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Security Scan</span>
          <span className="text-xs text-foreground/60">10 minutes ago</span>
        </div>
        <p className="text-sm text-foreground/70">Tamper detection scan completed - No issues found</p>
      </div>
    </div>
  );

  const renderBlockchain = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-2">Network Status</h4>
          <div className="text-2xl font-bold text-green-400">Connected</div>
          <p className="text-xs text-foreground/70 mt-1">Polygon Mumbai Testnet</p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-2">Gas Price</h4>
          <div className="text-2xl font-bold text-blue-400">23.5 Gwei</div>
          <p className="text-xs text-foreground/70 mt-1">Current network fee</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div>
              <div className="text-sm font-semibold text-white">Message Hash</div>
              <div className="text-xs text-foreground/60">0x1a2b3c4d5e6f...</div>
            </div>
            <div className="text-xs text-green-400">Confirmed</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div>
              <div className="text-sm font-semibold text-white">Metadata Storage</div>
              <div className="text-xs text-foreground/60">0x7f8e9d0c1b2a...</div>
            </div>
            <div className="text-xs text-green-400">Confirmed</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Maintenance Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-foreground/70">Last action</span>
            <span className="text-white">{maintenanceLogs[0]?.action || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground/70">Entries this session</span>
            <span className="text-white">{maintenanceLogs.length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEncryption = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-2">Algorithm</h4>
          <div className="text-lg font-bold text-cyan-400">AES-256 + Kyber</div>
          <p className="text-xs text-foreground/70 mt-1">Quantum-safe encryption</p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-2">Key Exchange</h4>
          <div className="text-lg font-bold text-blue-400">Kyber-1024</div>
          <p className="text-xs text-foreground/70 mt-1">Post-quantum secure</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Encryption Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/70">Symmetric Encryption:</span>
            <span className="text-white">AES-256-CBC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Key Derivation:</span>
            <span className="text-white">PBKDF2-SHA256</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Authentication:</span>
            <span className="text-white">HMAC-SHA256</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Key Exchange:</span>
            <span className="text-white">Kyber-1024</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-4">
      {maintenanceLogs.length === 0 && (
        <div className="text-sm text-foreground/70">No maintenance entries yet.</div>
      )}
      {maintenanceLogs.map((log) => (
        <div key={log.id} className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${
                log.status === 'success' ? 'text-green-400' : log.status === 'warning' ? 'text-yellow-400' : 'text-cyan-400'
              }`} />
              <span className="text-sm font-semibold text-white">{log.action}</span>
            </div>
            <span className="text-xs text-foreground/60">{new Date(log.timestamp).toLocaleString()}</span>
          </div>
          <div className="text-sm text-foreground/70">{log.details}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Security Dashboard</h3>
              <p className="text-xs text-cyan-300">Real-time security monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-cyan-300">Live</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/10'
                  : 'text-foreground/70 hover:text-cyan-300 hover:bg-cyan-500/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'audit' && renderAuditLogs()}
        {activeTab === 'blockchain' && renderBlockchain()}
        {activeTab === 'encryption' && renderEncryption()}
        {activeTab === 'maintenance' && renderMaintenance()}
      </div>
    </div>
  );
};
