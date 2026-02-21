import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { DateSeparator } from '../components/DateSeparator';

interface Message {
  id: string;
  chatId: string;
  senderId: number;
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  senderUsername?: string;
}

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
      contactName: string;
      contactId: number;
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId, contactName, contactId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState(0);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Theme Colors
  const Colors = {
    background: '#0A0A0A',
    primary: '#d4af37',
    secondary: '#8b4513',
    glass: 'rgba(26, 26, 26, 0.85)',
    border: 'rgba(212, 175, 55, 0.2)',
    textMain: '#EAEAEA',
    textSecondary: '#A0A0A0',
    inputBackground: '#101010',
    sentMessage: '#d4af37',
    receivedMessage: '#1a1a1a',
    statusSending: '#666666',
    statusSent: '#d4af37',
    statusDelivered: '#4CAF50',
    statusRead: '#2196F3',
  };

  useEffect(() => {
    initializeChat();
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setAccessToken(token);
        setUserId(user.id);
        setupWebSocket(token, user.deviceId);
        loadMessages();
        navigation.setOptions({ title: contactName });
      }
    } catch (error) {
      console.error('Chat initialization error:', error);
      Alert.alert('Error', 'Failed to initialize chat');
    }
  };

  const setupWebSocket = (token: string, deviceId: string) => {
    try {
      const ws = new WebSocket(`ws://localhost:3001`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        // Authenticate
        ws.send(JSON.stringify({
          type: 'authenticate',
          token,
          deviceId
        }));
        
        // Join chat
        ws.send(JSON.stringify({
          type: 'join_chat',
          chatId,
          userId,
          deviceId
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleMessage(data);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsOnline(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsOnline(false);
      };

      setWebsocket(ws);
    } catch (error) {
      console.error('WebSocket setup error:', error);
      setIsOnline(false);
    }
  };

  const handleMessage = (data: any) => {
    switch (data.type) {
      case 'authenticated':
        setIsOnline(true);
        break;
      case 'message_history':
        setMessages(data.messages || []);
        break;
      case 'new_chat_message':
        addNewMessage(data);
        break;
      case 'message_delivered':
        updateMessageStatus(data.messageId, 'delivered');
        break;
      case 'user_online':
        setIsOnline(true);
        break;
      case 'user_offline':
        setIsOnline(false);
        break;
      case 'typing_indicator':
        setIsTyping(data.isTyping);
        break;
    }
  };

  const addNewMessage = (messageData: any) => {
    const newMessage: Message = {
      id: messageData.id,
      chatId: messageData.chatId,
      senderId: messageData.senderId,
      content: messageData.content,
      timestamp: messageData.timestamp,
      status: messageData.status,
      isEncrypted: messageData.encrypted,
      senderUsername: messageData.senderUsername
    };

    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim() || !websocket) return;

    const messageData = {
      type: 'send_chat_message',
      chatId,
      senderId: userId,
      content: inputText.trim(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      encrypted: true
    };

    websocket.send(JSON.stringify(messageData));
    setInputText('');
    
    // Add to local messages immediately
    const newMessage: Message = {
      id: messageData.messageId,
      chatId,
      senderId: userId,
      content: inputText.trim(),
      timestamp: messageData.timestamp,
      status: 'sending',
      isEncrypted: true
    };

    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (websocket) {
      websocket.send(JSON.stringify({
        type: 'typing_indicator',
        chatId,
        userId,
        isTyping
      }));
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    
    if (text.length > 0) {
      sendTypingIndicator(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 1000);
    } else {
      sendTypingIndicator(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSent = item.senderId === userId;
    
    return (
      <MessageBubble
        message={item}
        isSent={isSent}
        showStatus={isSent}
        colors={Colors}
      />
    );
  };

  const renderDateSeparator = (index: number) => {
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    
    if (!previousMessage) return null;
    
    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);
    
    if (currentDate.toDateString() !== previousDate.toDateString()) {
      return (
        <DateSeparator
          date={currentDate}
          colors={Colors}
        />
      );
    }
    
    return null;
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending': return '↻';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sending': return Colors.statusSending;
      case 'sent': return Colors.statusSent;
      case 'delivered': return Colors.statusDelivered;
      case 'read': return Colors.statusRead;
      default: return Colors.textSecondary;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: Colors.glass }]}>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: Colors.textMain }]}>
            {contactName}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? '#4CAF50' : '#666666' }
            ]} />
            <Text style={[styles.statusText, { color: Colors.textSecondary }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListFooterComponent={
          isTyping ? (
            <TypingIndicator 
              username={contactName}
              colors={Colors}
            />
          ) : null
        }
        onContentSizeChange={scrollToBottom}
      />

      <View style={[styles.inputContainer, { backgroundColor: Colors.glass }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: Colors.inputBackground,
            color: Colors.textMain
          }]}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: Colors.primary }]}
          onPress={sendMessage}
          disabled={!inputText.trim() || !isOnline}
        >
          <Text style={[styles.sendButtonText, { color: '#000' }]}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});