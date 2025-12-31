"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, Lock, Shield, Users, Settings, LogOut, MessageCircle, Check, CheckCheck, Circle, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  timestamp: number
  encrypted: boolean
  status: 'sent' | 'delivered' | 'read'
  readBy?: string[]
}

interface Contact {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: number
  online: boolean
  publicKey?: string
  isTyping?: boolean
}

interface TypingUser {
  userId: string
  timestamp: number
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isEncrypted, setIsEncrypted] = useState(true)
  const [sharedSecret, setSharedSecret] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>(undefined)
  // @ts-ignore
  const router = useRouter()

  // WebSocket connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('Connected to server')
      setIsConnected(true)

      // Authenticate with server
      ws.send(JSON.stringify({
        type: 'authenticate',
        deviceId: 'web-client-' + Date.now(),
        signature: 'demo-signature'
      }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }

    ws.onclose = () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  // Join chat when contact is selected
  useEffect(() => {
    if (socket && selectedContact && isConnected) {
      const chatId = `chat-${[localStorage.getItem('userId') || 'me', selectedContact.id].sort().join('-')}`

      socket.send(JSON.stringify({
        type: 'join_chat',
        chatId,
        userId: localStorage.getItem('userId') || 'me'
      }))
    }
  }, [selectedContact, socket, isConnected])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'authenticated':
        console.log('Authenticated with server')
        break

      case 'message_history':
        setMessages(data.messages)
        break

      case 'new_chat_message':
        setMessages(prev => [...prev, data])
        break

      case 'message_delivered':
        setMessages(prev => prev.map(msg =>
          msg.id === data.messageId ? { ...msg, status: 'delivered' as const } : msg
        ))
        break

      case 'message_read':
        setMessages(prev => prev.map(msg =>
          msg.id === data.messageId ? { ...msg, status: 'read' as const } : msg
        ))
        break

      case 'user_typing':
        if (data.isTyping) {
          setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), {
            userId: data.userId,
            timestamp: Date.now()
          }])
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
        }
        break

      case 'user_online':
        setContacts(prev => prev.map(contact =>
          contact.id === data.userId ? { ...contact, online: true } : contact
        ))
        break

      case 'user_offline':
        setContacts(prev => prev.map(contact =>
          contact.id === data.userId ? { ...contact, online: false } : contact
        ))
        break
    }
  }

  // Initialize crypto and check authentication
  useEffect(() => {
    const initChat = async () => {
      const token = localStorage.getItem('authToken')
      const userId = localStorage.getItem('userId')

      if (!token || !userId) {
        router.push('/login')
        return
      }

      // Generate shared secret for selected contact (in real app, this would be exchanged securely)
      if (selectedContact) {
        const secret = 'demo-shared-secret-' + selectedContact.id
        setSharedSecret(secret)
      }
    }

    initChat()
  }, [selectedContact, router])

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/contacts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setContacts(data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
      }
    }

    if (isConnected) {
      fetchContacts()
    }
  }, [isConnected])

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      // In a real app, this would call an API like `/api/users/search?q=${searchQuery}`
      // For now, we simulate a search result or search existing contacts
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/search?q=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const addContact = async (contact: Contact) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/contacts/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ contactId: contact.id })
      })

      if (response.ok) {
        if (!contacts.find(c => c.id === contact.id)) {
          setContacts(prev => [...prev, contact])
        }
        setSelectedContact(contact)
      } else {
        console.error('Failed to add contact to database')
      }
    } catch (error) {
      console.error('Add contact error:', error)
    } finally {
      setSearchQuery("")
      setSearchResults([])
    }
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Clear typing users after timeout
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(user =>
        Date.now() - user.timestamp < 3000 // Remove after 3 seconds
      ))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleTyping = () => {
    if (!socket || !selectedContact || !isConnected) return

    if (!isTyping) {
      setIsTyping(true)
      const chatId = `chat-${[localStorage.getItem('userId') || 'me', selectedContact.id].sort().join('-')}`

      socket.send(JSON.stringify({
        type: 'typing_start',
        chatId,
        userId: localStorage.getItem('userId') || 'me'
      }))
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      const chatId = `chat-${[localStorage.getItem('userId') || 'me', selectedContact.id].sort().join('-')}`

      socket.send(JSON.stringify({
        type: 'typing_stop',
        chatId,
        userId: localStorage.getItem('userId') || 'me'
      }))
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !socket || !isConnected) return

    try {
      const messageId = Date.now().toString()
      const chatId = `chat-${[localStorage.getItem('userId') || 'me', selectedContact.id].sort().join('-')}`
      const senderId = localStorage.getItem('userId') || 'me'

      let content = newMessage
      if (isEncrypted && sharedSecret) {
        // Simple demo encryption - in real app use proper crypto
        content = btoa(newMessage + '|' + sharedSecret)
      }

      const messageData = {
        type: 'send_chat_message',
        chatId,
        senderId,
        content,
        messageId,
        timestamp: Date.now(),
        encrypted: isEncrypted
      }

      socket.send(JSON.stringify(messageData))

      // Add message to local state immediately
      const localMessage: Message = {
        id: messageId,
        chatId,
        senderId,
        content: isEncrypted ? content : newMessage,
        timestamp: Date.now(),
        encrypted: isEncrypted,
        status: 'sent'
      }

      setMessages(prev => [...prev, localMessage])
      setNewMessage("")

      // Stop typing
      if (isTyping) {
        setIsTyping(false)
        socket.send(JSON.stringify({
          type: 'typing_stop',
          chatId,
          userId: senderId
        }))
      }

    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleMessageRead = (messageId: string) => {
    if (!socket || !selectedContact || !isConnected) return

    const chatId = `chat-${[localStorage.getItem('userId') || 'me', selectedContact.id].sort().join('-')}`
    const readerId = localStorage.getItem('userId') || 'me'

    socket.send(JSON.stringify({
      type: 'mark_message_read',
      chatId,
      messageId,
      readerId
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('user')
    if (socket) {
      socket.close()
    }
    router.push('/login')
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const decryptMessageContent = (message: Message): string => {
    if (!message.encrypted || !sharedSecret) return message.content

    try {
      // Simple demo decryption - in real app use proper crypto
      const decoded = atob(message.content)
      const parts = decoded.split('|')
      return parts[0] // Return original message
    } catch (error) {
      return "[Decryption failed]"
    }
  }

  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== (localStorage.getItem('userId') || 'me')) return null

    switch (message.status) {
      case 'sent':
        return <Check className="w-3 h-3 opacity-70" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 opacity-70" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return <Circle className="w-3 h-3 opacity-50" />
    }
  }

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-cyan-500/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">QuantumSafe</h1>
                <p className="text-xs text-cyan-400">Real-time Chat</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="bg-slate-700/50 border-cyan-500/30 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
            />
            <Button size="sm" onClick={handleSearchUsers} className="bg-cyan-500 hover:bg-cyan-600">
              Search
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-2 bg-slate-900/50 p-2 rounded-lg border border-cyan-500/20">
              <p className="text-xs text-slate-400 mb-1">Results:</p>
              {searchResults.map(result => (
                <div
                  key={result.id}
                  onClick={() => addContact(result)}
                  className="flex items-center gap-2 p-2 hover:bg-cyan-500/20 rounded cursor-pointer"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[10px]">{result.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">{result.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedContact?.id === contact.id
                  ? 'bg-cyan-500/20 border border-cyan-500/30'
                  : 'hover:bg-slate-700/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-300">
                        {contact.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white truncate">{contact.name}</p>
                      {contact.lastMessageTime && (
                        <span className="text-xs text-slate-400">
                          {formatTime(contact.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {contact.lastMessage && (
                      <p className="text-sm text-slate-400 truncate">{contact.lastMessage}</p>
                    )}
                    {typingUsers.some(user => user.userId === contact.id) && (
                      <p className="text-xs text-cyan-400 italic">typing...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {selectedContact ? (
          <div className="p-4 border-b border-cyan-500/20 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-300">
                    {selectedContact.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-white">{selectedContact.name}</h2>
                  <p className="text-sm text-slate-400">
                    {selectedContact.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                  <Lock className="w-3 h-3 mr-1" />
                  {isEncrypted ? 'Encrypted' : 'Unencrypted'}
                </Badge>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-cyan-500/20 bg-slate-800/50">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400">Select a contact to start chatting</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => message.senderId !== (localStorage.getItem('userId') || 'me') && handleMessageRead(message.id)}
                className={`flex ${message.senderId === (localStorage.getItem('userId') || 'me') ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === (localStorage.getItem('userId') || 'me')
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-white'
                    }`}
                >
                  <p className="text-sm">{decryptMessageContent(message)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    <div className="flex items-center">
                      {message.encrypted && (
                        <Lock className="w-3 h-3 opacity-50 mr-1" />
                      )}
                      {getMessageStatusIcon(message)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Typing Indicator */}
        {selectedContact && typingUsers.some(user => user.userId === selectedContact.id) && (
          <div className="px-4 py-2 text-sm text-slate-400 italic">
            {selectedContact.name} is typing...
          </div>
        )}

        {/* Message Input */}
        {selectedContact && (
          <div className="p-4 border-t border-cyan-500/20 bg-slate-800/50">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your secure message..."
                className="flex-1 bg-slate-700/50 border-cyan-500/30 focus:border-cyan-400 text-white placeholder-slate-400"
                disabled={!isConnected}
              />
              <Button
                onClick={() => setIsEncrypted(!isEncrypted)}
                variant={isEncrypted ? "default" : "outline"}
                size="sm"
                className={isEncrypted ? "bg-cyan-500 hover:bg-cyan-600" : ""}
              >
                <Lock className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Messages are {isEncrypted ? 'end-to-end encrypted' : 'sent unencrypted'}</span>
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
