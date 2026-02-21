"use client"

import { useState, useEffect } from "react"
import { Shield, AlertTriangle, Eye, Cpu, Database, Globe, Activity, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getHoneypotStats, getRecentEvents } from "@/lib/honeypot"

interface HoneypotStats {
  totalEvents: number
  puzzleFailures: number
  decoyAccesses: number
  apiHoneypotHits: number
  fakeSessionsCreated: number
  suspiciousIPs: number
  blockedAttempts: number
  confusionScore: number
}

interface RecentEvent {
  id: string
  type: string
  ip: string
  userAgent: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function HoneypotDashboard() {
  const [stats, setStats] = useState<HoneypotStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, eventsData] = await Promise.all([
          getHoneypotStats(),
          getRecentEvents(10)
        ])
        setStats(statsData)
        setRecentEvents(eventsData)
      } catch (error) {
        console.error('Failed to load honeypot data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
          <p className="text-slate-400">Loading honeypot telemetry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/50">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Honeypot Control Center
            </h1>
            <p className="text-slate-400 mt-2">Real-time attacker confusion metrics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-300">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats?.totalEvents || 0}</div>
              <p className="text-xs text-slate-400">Honeypot interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">Puzzle Failures</CardTitle>
              <Cpu className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{stats?.puzzleFailures || 0}</div>
              <p className="text-xs text-slate-400">Failed Argon2 challenges</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">Decoy Accesses</CardTitle>
              <Eye className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats?.decoyAccesses || 0}</div>
              <p className="text-xs text-slate-400">Fake page visits</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Confusion Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{stats?.confusionScore || 0}%</div>
              <p className="text-xs text-slate-400">Attacker disorientation</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="bg-slate-800/50 border-slate-600/20">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Recent Honeypot Events
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest attacker interactions and suspicious activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No recent events</p>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/20">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={event.severity === 'critical' ? 'destructive' :
                                event.severity === 'high' ? 'default' :
                                event.severity === 'medium' ? 'secondary' : 'outline'}
                        className="capitalize"
                      >
                        {event.severity}
                      </Badge>
                      <div>
                        <p className="font-medium text-slate-200">{event.type}</p>
                        <p className="text-sm text-slate-400">{event.ip} • {event.userAgent.slice(0, 50)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Storage Honeytokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Fake credentials deployed</p>
              <p className="text-sm text-slate-400 mt-2">Monitoring access patterns</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Crawler Traps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Decoy sitemaps active</p>
              <p className="text-sm text-slate-400 mt-2">robots.txt configured</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                API Honeypots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Fake endpoints responding</p>
              <p className="text-sm text-slate-400 mt-2">Rate limiting active</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Alert */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            <strong>Active Defense:</strong> All honeypot systems are operational.
            Suspicious activities are being logged and attackers are being redirected to decoy environments.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
