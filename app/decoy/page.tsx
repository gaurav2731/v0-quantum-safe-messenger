"use client"

import { useState, useEffect } from "react"
import { Shield, AlertTriangle, Lock, Eye, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DecoyPage() {
  const [fakeEmail, setFakeEmail] = useState("")
  const [fakePassword, setFakePassword] = useState("")
  const [isScanning, setIsScanning] = useState(true)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResults, setScanResults] = useState<string[]>([])

  // Simulate security scan
  useEffect(() => {
    const scanSteps = [
      "Initializing security protocols...",
      "Scanning for vulnerabilities...",
      "Checking encryption integrity...",
      "Verifying quantum resistance...",
      "Analyzing threat patterns...",
      "Generating security report..."
    ]

    let stepIndex = 0
    const interval = setInterval(() => {
      if (stepIndex < scanSteps.length) {
        setScanResults(prev => [...prev, scanSteps[stepIndex]])
        setScanProgress(((stepIndex + 1) / scanSteps.length) * 100)
        stepIndex++
      } else {
        setIsScanning(false)
        clearInterval(interval)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const handleFakeLogin = () => {
    // This is a honeypot - just show an error
    alert("Access Denied: Security credentials invalid. Please contact system administrator.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900/20 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/50">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Security Alert
            </h1>
            <p className="text-red-300 mt-2">System Security Verification Required</p>
          </div>
        </div>

        {/* Security Scan */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Security Scan in Progress</h2>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Scanning system...</span>
                <span className="text-cyan-400">{Math.round(scanProgress)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Scan Results */}
            <div className="bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="space-y-1">
                {scanResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">{result}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isScanning && (
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300">
                  <strong>Security Issue Detected:</strong> Suspicious activity pattern identified.
                  Manual verification required. Please provide additional credentials below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Fake Login Form */}
        {!isScanning && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Manual Verification</h3>
                <p className="text-slate-400 text-sm">
                  Please re-enter your credentials for security verification
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleFakeLogin(); }} className="space-y-4">
                {/* Fake Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="fakeEmail" className="text-red-300 font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="fakeEmail"
                      type="email"
                      value={fakeEmail}
                      onChange={(e) => setFakeEmail(e.target.value)}
                      placeholder="Re-enter your email"
                      className="pl-10 bg-slate-700/50 border-red-500/30 focus:border-red-400 text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Fake Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="fakePassword" className="text-red-300 font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="fakePassword"
                      type="password"
                      value={fakePassword}
                      onChange={(e) => setFakePassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="pl-10 bg-slate-700/50 border-red-500/30 focus:border-red-400 text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Fake Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-3 shadow-lg shadow-red-500/50"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Verify Credentials
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs text-slate-500">
                  🔒 This system is protected by advanced security measures
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            If you believe this is an error, please contact the system administrator
          </p>
        </div>
      </div>
    </div>
  )
}
