import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const App = () => {
  // --- Theme Colors ---
  const Colors = {
    background: '#0A0A0A',
    primary: '#d4af37',
    secondary: '#8b4513',
    glass: 'rgba(26, 26, 26, 0.85)',
    border: 'rgba(212, 175, 55, 0.2)',
    textMain: '#EAEAEA',
  };

  // --- Reusable Styles ---
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    glassPanel: {
      width: '90%',
      maxWidth: 400,
      paddingVertical: 50,
      paddingHorizontal: 35,
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 40,
      alignItems: 'center',
      gap: 20,
    },
    title: {
      color: Colors.primary,
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: 5,
      marginBottom: 10,
    },
    input: {
      width: '100%',
      backgroundColor: '#101010',
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 25,
      paddingVertical: 18,
      paddingHorizontal: 25,
      textAlign: 'center',
      color: Colors.textMain,
      fontSize: 16,
    },
    button: {
      width: '100%',
      borderRadius: 25,
      paddingVertical: 18,
      marginTop: 10,
      // Gradient requires a library, so we use a solid color for now
      backgroundColor: Colors.primary,
    },
    buttonText: {
      color: '#000',
      fontWeight: '700',
      fontSize: 16,
      textAlign: 'center',
    },
  });

  // --- Login Screen Component ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.glassPanel}>
        <Text style={styles.title}>QUANTUM</Text>
        <TextInput
          style={styles.input}
          placeholder="Create Node ID"
          placeholderTextColor="#A0A0A0"
        />
        <TextInput
          style={styles.input}
          placeholder="Set Master PIN"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>INITIALIZE NODE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;
