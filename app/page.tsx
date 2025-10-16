"use client"

import { useState } from "react"
import { Lock, Shield, MessageSquare, CheckCircle2, ArrowRight, Menu, X, Sparkles, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat-interface"
import { BasicChat } from "@/components/basic-chat"
import { SimpleSecurityDashboard } from "@/components/simple-security-dashboard"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'dashboard'>('landing')
  const [currentUserId] = useState('user1')
  const [currentRecipientId] = useState('user2')

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <style>{`
        * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="3" fill="%2306b6d4"/><circle cx="16" cy="16" r="8" fill="none" stroke="%2306b6d4" strokeWidth="1" opacity="0.5"/></svg>') 16 16, auto;
        }
        a, button {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="4" fill="%2306b6d4"/><circle cx="16" cy="16" r="10" fill="none" stroke="%2306b6d4" strokeWidth="1.5"/></svg>') 16 16, pointer;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-cyan-500/20 z-50 animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/80 transition-all duration-300">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              QuantumSafe
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Security", "How It Works"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-foreground/70 hover:text-cyan-400 transition-colors duration-300 relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentView('chat')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300 transform hover:scale-105"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
              <Button 
                onClick={() => setCurrentView('dashboard')}
                variant="outline"
                className="border-2 border-cyan-500/40 hover:border-cyan-500/80 hover:bg-cyan-500/10 bg-transparent transition-all duration-300 transform hover:scale-105"
              >
                <Settings className="w-4 h-4 mr-2" />
                Security Dashboard
            </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 bg-background/95 backdrop-blur-xl animate-slide-up">
            <div className="px-4 py-4 space-y-4">
              {["Features", "Security", "How It Works"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="block text-sm font-medium hover:text-cyan-400 transition-colors"
                >
                  {item}
                </a>
              ))}
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>


      {/* Conditional Views */}
      {currentView === 'chat' && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setCurrentView('landing')}
                    variant="outline"
                    className="border-cyan-500/40 hover:border-cyan-500/80"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back
                  </Button>
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                  <h2 className="font-bold text-white">Encrypted Future Chat</h2>
                  <p className="text-xs text-cyan-300">End-to-end encrypted messaging</p>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentView('dashboard')}
                  variant="outline"
                  className="border-cyan-500/40 hover:border-cyan-500/80"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Security
                </Button>
              </div>
            </div>
            
            {/* Chat Interface */}
            <div className="flex-1">
              <BasicChat userId={currentUserId} recipientId={currentRecipientId} />
            </div>
          </div>
        </div>
      )}

      {currentView === 'dashboard' && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          <div className="h-full flex flex-col">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setCurrentView('landing')}
                    variant="outline"
                    className="border-cyan-500/40 hover:border-cyan-500/80"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back
                  </Button>
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Security Dashboard</h2>
                    <p className="text-xs text-cyan-300">Quantum-safe security monitoring</p>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentView('chat')}
                  variant="outline"
                  className="border-cyan-500/40 hover:border-cyan-500/80"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
            
            {/* Security Dashboard */}
            <div className="flex-1 overflow-y-auto">
              <SimpleSecurityDashboard userId={currentUserId} />
            </div>
          </div>
        </div>
      )}

      {/* Landing Page Content - Only show when currentView is 'landing' */}
      {currentView === 'landing' && (
        <>
          {/* Hero Section */}
          <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
            <div
              className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
              <div className="space-y-8 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-full hover:border-cyan-500/60 transition-all duration-300 group">
                  <Sparkles className="w-4 h-4 text-cyan-400 group-hover:animate-spin" />
                  <span className="text-sm font-semibold text-cyan-300">🔐 Quantum-Safe Encryption</span>
                </div>

                <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black leading-tight text-balance bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                Encrypted Future - Secure Messaging
              </h1>
                  <p className="text-xl text-foreground/70 leading-relaxed max-w-lg font-medium">
                    Experience truly private communication protected by Post-Quantum Cryptography. Every message is
                    encrypted, verified on blockchain, and tamper-proof.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    onClick={() => setCurrentView('chat')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-7 text-base font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300 transform hover:scale-105 group"
                  >
                    Start Messaging <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    onClick={() => setCurrentView('dashboard')}
                    variant="outline"
                    className="px-8 py-7 text-base font-semibold border-2 border-cyan-500/40 hover:border-cyan-500/80 hover:bg-cyan-500/10 bg-transparent transition-all duration-300 transform hover:scale-105"
                  >
                    View Security Dashboard
                  </Button>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative h-96 md:h-full min-h-96 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-600/20 rounded-3xl blur-3xl animate-glow-pulse"></div>
                <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-3xl border-2 border-cyan-500/30 p-8 h-full flex flex-col justify-between backdrop-blur-sm hover:border-cyan-500/60 transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 group/item">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-cyan-300/50 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover/item:shadow-cyan-500/80 transition-all">
                        <span className="text-xs font-bold text-white">You</span>
                      </div>
                      <div className="text-sm font-semibold text-cyan-300">Connected & Secure</div>
                    </div>
                    {[
                      "🔒 Message encrypted with Kyber + AES-256",
                      "⛓️ Metadata logged on blockchain",
                      "✓ Verifiable & Tamper-proof",
                    ].map((msg, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-slate-800/80 to-slate-700/60 rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 transform hover:translate-x-2 group/msg"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <p className="text-sm font-medium text-cyan-300 group-hover/msg:text-cyan-200 transition-colors">
                          {msg}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                    <span>Quantum-Safe Protocol</span>
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section
            id="features"
            className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-background border-y border-cyan-500/20"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20 space-y-4">
                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                  Core Features
                </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-medium">
                  Everything you need for secure, verifiable communication
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Lock,
                    title: "PQC Encryption",
                    description: "Kyber key exchange + AES-256 encryption resistant to quantum attacks",
                  },
                  {
                    icon: MessageSquare,
                    title: "1-on-1 Messaging",
                    description: "Direct encrypted messages with end-to-end security",
                  },
                  {
                    icon: Shield,
                    title: "Blockchain Logging",
                    description: "Immutable message metadata stored on public blockchain",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Verifiable Integrity",
                    description: "Cryptographic proof that messages haven't been tampered with",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="group relative"
                    onMouseEnter={() => setHoveredFeature(idx)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-2 border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/60 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm">
                      <div className="mb-6 inline-block p-3 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-xl border border-cyan-500/40 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                        <feature.icon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                      </div>
                      <h3 className="font-black text-lg mb-3 text-white group-hover:text-cyan-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-foreground/70 leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Security Highlights */}
          <section id="security" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-10 animate-slide-up">
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                      Military-Grade Security
                    </h2>
                    <p className="text-lg text-foreground/70 font-medium">
                      Built with cryptographic standards designed to withstand quantum computing threats
                    </p>
                  </div>

                  {[
                    { title: "Post-Quantum Cryptography", desc: "Kyber algorithm approved by NIST for quantum resistance" },
                    { title: "Blockchain Verification", desc: "Immutable audit trail on Polygon Mumbai testnet" },
                    { title: "End-to-End Encryption", desc: "Only sender and receiver can decrypt messages" },
                    { title: "Tamper Detection", desc: "Cryptographic hashes ensure message integrity" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 group p-4 rounded-xl hover:bg-cyan-500/10 transition-all duration-300 transform hover:translate-x-2"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/40 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                          <CheckCircle2 className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-black text-white group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                        <p className="text-sm text-foreground/70 mt-1 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security Visual */}
                <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-600/20 rounded-3xl blur-3xl animate-glow-pulse"></div>
                  <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-3xl border-2 border-cyan-500/30 p-10 backdrop-blur-sm hover:border-cyan-500/60 transition-all duration-300">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-2xl border border-cyan-500/40 mb-4">
                          <Shield className="w-12 h-12 text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white">Security Layers</h3>
                      </div>
                      <div className="space-y-3">
                        {["Quantum-Safe Encryption", "Blockchain Verification", "Tamper Detection", "Audit Trail"].map(
                          (layer, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/60 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 transform hover:translate-x-2 group"
                            >
                              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all"></div>
                              <span className="text-sm font-semibold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                                {layer}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section
            id="how-it-works"
            className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-background border-y border-cyan-500/20"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20 space-y-4">
                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="text-lg text-foreground/70 font-medium">Step-by-step guide to using Encrypted Future</p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { 
                    step: "1", 
                    title: "Access", 
                    desc: "Open your browser and navigate to localhost:3001 to access the application",
                    details: "Simply visit the URL in any modern web browser. No installation required!"
                  },
                  { 
                    step: "2", 
                    title: "Start Chat", 
                    desc: "Click 'Start Messaging' button to enter the secure chat interface",
                    details: "The chat interface loads with sample messages and security indicators active"
                  },
                  { 
                    step: "3", 
                    title: "Send Message", 
                    desc: "Type your message in the input box and press Enter or click Send",
                    details: "Watch the quantum-safe encryption process with visual feedback"
                  },
                  { 
                    step: "4", 
                    title: "Monitor Security", 
                    desc: "View real-time security status and blockchain verification",
                    details: "Check the Security Dashboard for comprehensive monitoring"
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group"
                    onMouseEnter={() => setHoveredStep(idx)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {idx < 3 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[40%] h-1 bg-gradient-to-r from-cyan-500/50 to-transparent group-hover:from-cyan-400 transition-all duration-300"></div>
                    )}
                    <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-2 border-cyan-500/20 rounded-2xl p-8 text-center hover:border-cyan-500/60 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border-2 border-cyan-500/40 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                        <span className="font-black text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="font-black text-xl mb-3 text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-foreground/70 leading-relaxed font-medium mb-3">{item.desc}</p>
                      <p className="text-xs text-cyan-300/80 leading-relaxed">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Detailed Instructions */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                  Complete User Guide
                </h2>
                <p className="text-lg text-foreground/70 font-medium">Detailed instructions for using Encrypted Future</p>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Getting Started */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-2 border-cyan-500/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-400 font-bold">1</span>
                      </div>
                      Getting Started
                    </h3>
                    <div className="space-y-4 text-sm text-foreground/80">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Open Browser:</strong> Navigate to <code className="bg-slate-700 px-2 py-1 rounded text-cyan-300">http://localhost:3001</code></p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Landing Page:</strong> Explore the features and security highlights</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Navigation:</strong> Use "Start Messaging" or "View Security Dashboard" buttons</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-2 border-cyan-500/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-400 font-bold">2</span>
                      </div>
                      Using the Chat
                    </h3>
                    <div className="space-y-4 text-sm text-foreground/80">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Message Input:</strong> Type in the text box at the bottom of the chat</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Send Message:</strong> Press Enter or click the Send button (paper airplane icon)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Encryption Process:</strong> Watch the "Encrypting..." animation during sending</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Message Bubbles:</strong> Your messages appear on the right, received on the left</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-2 border-cyan-500/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-400 font-bold">3</span>
                      </div>
                      Security Dashboard
                    </h3>
                    <div className="space-y-4 text-sm text-foreground/80">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Access Dashboard:</strong> Click "Security" button in the top-right corner</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Overview Tab:</strong> View real-time security metrics and system status</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Audit Logs:</strong> Monitor all security events and activities</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Blockchain Tab:</strong> View network statistics and transaction data</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Encryption Tab:</strong> Monitor cryptographic operations and key management</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-2 border-cyan-500/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-400 font-bold">4</span>
                      </div>
                      Security Features
                    </h3>
                    <div className="space-y-4 text-sm text-foreground/80">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Quantum-Safe Encryption:</strong> All messages encrypted with AES-256 + Kyber</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Blockchain Verification:</strong> Message metadata stored on Polygon Mumbai testnet</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Tamper Detection:</strong> Real-time monitoring for message integrity</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Audit Trail:</strong> Comprehensive logging of all security events</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Start Guide */}
              <div className="mt-16 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20 border-2 border-cyan-500/30 rounded-2xl p-8">
                <h3 className="text-3xl font-black text-white mb-6 text-center">Quick Start Guide</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <h4 className="font-bold text-white mb-2">1. Open Browser</h4>
                    <p className="text-sm text-foreground/70">Navigate to localhost:3001</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h4 className="font-bold text-white mb-2">2. Start Chatting</h4>
                    <p className="text-sm text-foreground/70">Click "Start Messaging" and send messages</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔐</span>
                    </div>
                    <h4 className="font-bold text-white mb-2">3. Monitor Security</h4>
                    <p className="text-sm text-foreground/70">View real-time security dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { stat: "256-bit", label: "Encryption" },
                  { stat: "100%", label: "Quantum-Safe" },
                  { stat: "Immutable", label: "Blockchain Logs" },
                  { stat: "Zero", label: "Trust Required" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="text-center group p-6 rounded-2xl hover:bg-cyan-500/10 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3 group-hover:text-cyan-300 transition-colors">
                      {item.stat}
                    </div>
                    <div className="text-foreground/70 font-semibold group-hover:text-cyan-300 transition-colors">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20 border-y border-cyan-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
              <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                Ready for Encrypted Future?
              </h2>
              <p className="text-xl text-foreground/70 mb-10 font-medium">
                Join the future of secure messaging. Start protecting your conversations today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setCurrentView('chat')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-7 text-base font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300 transform hover:scale-105 group"
                >
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => setCurrentView('dashboard')}
                  variant="outline"
                  className="px-10 py-7 text-base font-semibold border-2 border-cyan-500/40 hover:border-cyan-500/80 hover:bg-cyan-500/10 bg-transparent transition-all duration-300 transform hover:scale-105"
                >
                  View Security Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/80 transition-all">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                    <span className="font-black text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Encrypted Future
                    </span>
              </div>
              <p className="text-sm text-foreground/70 font-medium">Quantum-safe encrypted messaging for everyone.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Security", "Pricing"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-black mb-4 text-white">{col.title}</h4>
                <ul className="space-y-3 text-sm text-foreground/70">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-cyan-400 transition-colors duration-300 font-medium">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-foreground/70 font-medium">
            <p>&copy; 2025 QuantumSafe. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {["Twitter", "GitHub", "Discord"].map((social) => (
                <a key={social} href="#" className="hover:text-cyan-400 transition-colors duration-300">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  )
}
