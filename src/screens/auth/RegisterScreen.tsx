// src/screens/auth/RegisterScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { registerAction, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    return () => clearError();
  }, []);

  const handleRegister = async () => {
    setLocalError('');
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError('Tous les champs sont obligatoires.');
      return;
    }
    if (username.trim().length < 3) {
      setLocalError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
      return;
    }
    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }
    await registerAction(email.trim(), password, username.trim());
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TikTok</Text>
          <Text style={styles.subtitle}>Crée ton compte</Text>
        </View>

        <View style={styles.form}>
          {displayError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#666"
            value={username}
            onChangeText={(text) => { setUsername(text); setLocalError(''); if (error) clearError(); }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={(text) => { setEmail(text); setLocalError(''); if (error) clearError(); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#666"
            value={password}
            onChangeText={(text) => { setPassword(text); setLocalError(''); if (error) clearError(); }}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); setLocalError(''); if (error) clearError(); }}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}>
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>S'inscrire</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fe2c55',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#2a0a0f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#fe2c55',
  },
  errorText: {
    color: '#fe2c55',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#fe2c55',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  footerLink: {
    color: '#fe2c55',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;