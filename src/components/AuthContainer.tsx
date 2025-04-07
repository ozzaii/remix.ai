/**
 * User Authentication Components for REMIX.AI
 * 
 * This file implements the user authentication components including
 * login, registration, and profile management.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../state';
import { ComponentErrorBoundary } from '../core';

// Login component
export const Login = ({ onToggleForm }: { onToggleForm: () => void }) => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = () => {
    if (!email || !password) return;
    login(email, password);
  };
  
  return (
    <ComponentErrorBoundary componentName="Login">
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Welcome Back</Text>
        <Text style={styles.formSubtitle}>Sign in to continue creating amazing beats</Text>
        
        {/* Email input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#999999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        
        {/* Password input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        
        {/* Error message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {/* Login button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!email || !password) && styles.submitButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={!email || !password || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
        
        {/* Forgot password */}
        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        {/* Register link */}
        <View style={styles.switchFormContainer}>
          <Text style={styles.switchFormText}>Don't have an account?</Text>
          <TouchableOpacity onPress={onToggleForm}>
            <Text style={styles.switchFormLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ComponentErrorBoundary>
  );
};

// Registration component
export const Register = ({ onToggleForm }: { onToggleForm: () => void }) => {
  const { register, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const validateForm = () => {
    if (!name) {
      setValidationError('Please enter your name');
      return false;
    }
    
    if (!email) {
      setValidationError('Please enter your email');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email');
      return false;
    }
    
    if (!password) {
      setValidationError('Please enter a password');
      return false;
    }
    
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    
    setValidationError(null);
    return true;
  };
  
  const handleRegister = () => {
    if (!validateForm()) return;
    register(name, email, password);
  };
  
  return (
    <ComponentErrorBoundary componentName="Register">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Sign up to start your musical journey</Text>
          
          {/* Name input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#999999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999999"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          {/* Email input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          {/* Password input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          
          {/* Confirm password input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          
          {/* Error message */}
          {(validationError || error) && (
            <Text style={styles.errorText}>{validationError || error}</Text>
          )}
          
          {/* Register button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!name || !email || !password || !confirmPassword) && styles.submitButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={!name || !email || !password || !confirmPassword || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          
          {/* Terms and conditions */}
          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
          
          {/* Login link */}
          <View style={styles.switchFormContainer}>
            <Text style={styles.switchFormText}>Already have an account?</Text>
            <TouchableOpacity onPress={onToggleForm}>
              <Text style={styles.switchFormLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ComponentErrorBoundary>
  );
};

// User profile component
export const UserProfile = () => {
  const { user, logout, isLoading } = useAuth();
  
  if (!user) {
    return null;
  }
  
  return (
    <ComponentErrorBoundary componentName="UserProfile">
      <View style={styles.profileContainer}>
        {/* Profile header */}
        <LinearGradient
          colors={['rgba(10, 132, 255, 0.8)', 'rgba(94, 92, 230, 0.8)']}
          style={styles.profileHeader}
        >
          {/* Profile image */}
          <View style={styles.profileImageContainer}>
            {user.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          {/* User info */}
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </LinearGradient>
        
        {/* Profile stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.beatsCreated || 0}</Text>
            <Text style={styles.statLabel}>Beats Created</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.followers || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.following || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        
        {/* Profile actions */}
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.profileActionButton}>
            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
            <Text style={styles.profileActionText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileActionButton}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            <Text style={styles.profileActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ComponentErrorBoundary>
  );
};

// Authentication container component
export const AuthContainer = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  
  const toggleForm = () => {
    setShowLogin(!showLogin);
  };
  
  if (isAuthenticated) {
    return <UserProfile />;
  }
  
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>REMIX.AI</Text>
      </View>
      
      {/* Auth forms */}
      {showLogin ? (
        <Login onToggleForm={toggleForm} />
      ) : (
        <Register onToggleForm={toggleForm} />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formSubtitle: {
    color: '#999999',
    fontSize: 16,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(10, 132, 255, 0.5)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0A84FF',
    fontSize: 14,
  },
  switchFormContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  switchFormText: {
    color: '#999999',
    fontSize: 14,
    marginRight: 4,
  },
  switchFormLink: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  termsLink: {
    color: '#0A84FF',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#999999',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 0.48,
    justifyContent: 'center',
  },
  profileActionText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 10,
    marginHorizontal: 16,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default AuthContainer;
