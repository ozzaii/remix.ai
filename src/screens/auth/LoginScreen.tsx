import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';
import Button from '../../components/common/Button';
import GradientCard from '../../components/common/GradientCard';
import { useAuth } from '../../services/auth/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Handle login
  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      login({ username });
      navigation.navigate('Main');
    }, 1500);
  };
  
  // Handle sign up
  const handleSignUp = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      login({ username });
      navigation.navigate('Main');
    }, 1500);
  };
  
  // Toggle between login and sign up
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + 20, 
            paddingBottom: insets.bottom + 20,
            minHeight: height - insets.top - insets.bottom
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[colors.vibrantPurple, colors.neonBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBackground}
          />
          <Text style={styles.logoText}>REMIX.AI</Text>
        </View>
        
        <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>
          {isSignUp 
            ? 'Sign up to start creating beats with AI'
            : 'Log in to continue your music journey'}
        </Text>
        
        <GradientCard style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          
          <Button
            title={isSignUp ? 'Sign Up' : 'Log In'}
            icon={isSignUp ? 'person-add' : 'log-in'}
            onPress={isSignUp ? handleSignUp : handleLogin}
            style={styles.authButton}
            loading={isLoading}
          />
          
          {!isSignUp && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => console.log('Forgot password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </GradientCard>
        
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
          </Text>
          <TouchableOpacity
            onPress={toggleAuthMode}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleButtonText}>
              {isSignUp ? 'Log In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>
        
        <Button
          title="Continue as Guest"
          icon="person-outline"
          variant="secondary"
          onPress={() => navigation.navigate('Main')}
          style={styles.guestButton}
        />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
      
      <LinearGradient
        colors={[colors.deepBlack + '00', colors.deepBlack]}
        style={[styles.bottomGradient, { height: 100 + insets.bottom }]}
        pointerEvents="none"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  title: {
    ...globalStyles.heading1,
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    padding: 24,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkBlue + '40',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.vibrantPurple + '30',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.white,
    ...globalStyles.bodyText,
  },
  errorText: {
    ...globalStyles.captionText,
    color: '#FF5252',
    marginBottom: 16,
    textAlign: 'center',
  },
  authButton: {
    marginTop: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  forgotPasswordText: {
    ...globalStyles.bodyTextSmall,
    color: colors.vibrantPurple,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  toggleText: {
    ...globalStyles.bodyText,
    color: colors.textSecondary,
    marginRight: 8,
  },
  toggleButton: {
    padding: 4,
  },
  toggleButtonText: {
    ...globalStyles.bodyText,
    color: colors.vibrantPurple,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textSecondary + '40',
  },
  orText: {
    ...globalStyles.bodyTextSmall,
    color: colors.textSecondary,
    marginHorizontal: 16,
  },
  guestButton: {
    width: '100%',
    marginBottom: 32,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  footerText: {
    ...globalStyles.captionText,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default LoginScreen;
