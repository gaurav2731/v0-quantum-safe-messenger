import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId] = useState(`device_${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          deviceId: deviceId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save tokens and user data
        await AsyncStorage.setItem('accessToken', data.tokens.accessToken);
        await AsyncStorage.setItem('refreshToken', data.tokens.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('deviceId', deviceId);

        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => navigation.replace('MainTabs') }
        ]);
      } else {
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Generate simple public key for demo
      const publicKey = `pubkey_${Math.random().toString(36).substr(2, 20)}`;
      const username = email.split('@')[0];

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email.trim(),
          password: password,
          deviceId: deviceId,
          publicKey: publicKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Registration successful! Please login.', [
          { text: 'OK', onPress: () => setIsRegistering(false) }
        ]);
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: Colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.glassPanel, { backgroundColor: Colors.glass }]}>
          <Text style={[styles.title, { color: Colors.primary }]}>
            {isRegistering ? 'REGISTER' : 'LOGIN'}
          </Text>
          
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            {isRegistering 
              ? 'Create your secure account' 
              : 'Access your encrypted messages'
            }
          </Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors.inputBackground,
                borderColor: Colors.border,
                color: Colors.textMain
              }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors.inputBackground,
                borderColor: Colors.border,
                color: Colors.textMain
              }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
            onPress={isRegistering ? handleRegister : handleLogin}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: '#000' }]}>
              {isLoading 
                ? 'PROCESSING...' 
                : (isRegistering ? 'CREATE ACCOUNT' : 'LOGIN')
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: Colors.border }]}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={[styles.secondaryButtonText, { color: Colors.textMain }]}>
              {isRegistering 
                ? 'Already have an account? Login' 
                : "Don't have an account? Register"
              }
            </Text>
          </TouchableOpacity>

          <View style={styles.securityInfo}>
            <Text style={[styles.securityText, { color: Colors.textSecondary }]}>
              🔐 Quantum-Safe Encryption
            </Text>
            <Text style={[styles.securityText, { color: Colors.textSecondary }]}>
              🛡️ End-to-End Protected
            </Text>
            <Text style={[styles.securityText, { color: Colors.textSecondary }]}>
              ⚡ Real-time Messaging
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  glassPanel: {
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 15,
    paddingVertical: 18,
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  secondaryButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  securityInfo: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    marginBottom: 8,
  },
});