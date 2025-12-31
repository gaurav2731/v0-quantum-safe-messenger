"use client"

import { useState, useEffect } from "react"
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, XCircle, Activity, Users, MessageSquare, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface SecurityMetrics {
  encryptionStrength: number
  activeConnections: number
  threatsBlocked: number
  messagesSecured: number
  uptime: number
  lastSecurityScan: Date
}

interface ActiveSession {
  id: string
  device: string
  location: string
  lastActive: Date
  isCurrent: boolean
}

interface SecurityAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: Date
  resolved: boolean
}

export default function SecurityDashboardPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    encryptionStrength: 98,
    activeConnections: 3,
    threatsBlocked: 47,
    messagesSecured: 12543,
    uptime: 99.9,
    lastSecurityScan: new Date()
  })

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      device: 'MacBook Pro - Chrome',
      location: 'San Francisco, CA',
      lastActive: new Date(),
      isCurrent: true
    },
    {
      id: '2',
      device: 'iPhone 15 - Safari',
      location: 'San Francisco, CA',
      lastActive: new Date(Date.now() - 3600000),
      isCurrent: false
    },
    {
      id: '3',
      device: 'Windows PC - Edge',
      location: 'New York, NY',
      lastActive: new Date(Date.now() - 7200000),
      isCurrent: false
    }
  ])

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Unusual login attempt from unknown location',
      timestamp: new Date(Date.now() - 1800000),
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      message: 'Security scan completed successfully',
      timestamp: new Date(Date.now() - 3600000),
      resolved: true
    },
    {
      id: '3',
      type: 'error',
      message: 'Failed decryption attempt blocked',
      timestamp: new Date(Date.now() - 7200000),
      resolved: true
    }
  ])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10'
      case 'error':
        return 'border-red-500/50 bg-red-500/10'
      case 'info':
        return 'border-blue-500/50 bg-blue-500/10'
      default:
        return 'border-green-500/50 bg-green-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/50">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Security Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Monitor your quantum-safe communication security in real-time</p>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-300">Encryption Strength</CardTitle>
              <Lock className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{metrics.encryptionStrength}%</div>
              <Progress value={metrics.encryptionStrength} className="mt-2" />
              <p className="text-xs text-slate-400 mt-1">Quantum-resistant</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{metrics.activeConnections}</div>
              <p className="text-xs text-slate-400 mt-1">Devices connected</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-300">Threats Blocked</CardTitle>
              <Shield className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{metrics.threatsBlocked}</div>
              <p className="text-xs text-slate-400 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Messages Secured</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{metrics.messagesSecured.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">End-to-end encrypted</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-600/20">
                <CardHeader>
                  <CardTitle className="text-slate-200 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Uptime</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-300">
                      {metrics.uptime}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Last Security Scan</span>
                    <span className="text-sm text-slate-400">
                      {metrics.lastSecurityScan.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Quantum Key Status</span>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">AI Threat Detection</span>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                      Enabled
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-600/20">
                <CardHeader>
                  <CardTitle className="text-slate-200 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">Message encrypted with Kyber-768</p>
                        <p className="text-xs text-slate-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">Potential threat signature detected</p>
                        <p className="text-xs text-slate-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">New device authenticated</p>
                        <p className="text-xs text-slate-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/20">
              <CardHeader>
                <CardTitle className="text-slate-200">Active Sessions</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your active sessions across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{session.device}</p>
                          <p className="text-sm text-slate-400">{session.location}</p>
                          <p className="text-xs text-slate-500">
                            Last active: {session.lastActive.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.isCurrent && (
                          <Badge variant="outline" className="border-green-500/30 text-green-300">
                            Current
                          </Badge>
                        )}
                        {!session.isCurrent && (
                          <Button variant="outline" size="sm" className="border-red-500/30 text-red-300 hover:bg-red-500/10">
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600/20">
              <CardHeader>
                <CardTitle className="text-slate-200">Security Alerts</CardTitle>
                <CardDescription className="text-slate-400">
                  Recent security events and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <Alert key={alert.id} className={getAlertColor(alert.type)}>
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <AlertDescription className="text-slate-200">
                            {alert.message}
                          </AlertDescription>
                          <p className="text-xs text-slate-400 mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <Badge variant="outline" className="border-green-500/30 text-green-300">
                              Resolved
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-600/20">
                <CardHeader>
                  <CardTitle className="text-slate-200">Encryption Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Quantum Key Exchange</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-300">
                      Kyber-768
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Digital Signatures</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-300">
                      Dilithium-3
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Symmetric Encryption</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-300">
                      AES-256-GCM
                    </Badge>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Update Security Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-600/20">
                <CardHeader>
                  <CardTitle className="text-slate-200">Privacy Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Message Metadata</span>
                    <Badge variant="outline" className="border-red-500/30 text-red-300">
                      Minimized
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Forward Secrecy</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-300">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Self-Destruct Messages</span>
                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                      Optional
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    Configure Privacy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
