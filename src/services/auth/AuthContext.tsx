import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define User type (adjust properties as needed)
interface User {
  id: string; 
  email: string;
  username?: string; // Make username optional if it might not exist
  // Add other user properties here
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>; // Allow partial updates
}

// Create context with the defined type (or null initially)
const AuthContext = createContext<AuthContextType | null>(null);

// Define props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson) as User);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserSession();
  }, []);
  
  // Login function
  const login = async (userData: User) => {
    try {
      // Save user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem('user');
      
      // Update state
      setUser(null);
      
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  };
  
  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      // Merge with existing user data
      const updatedUser = { ...user, ...userData } as User;
      
      // Save updated user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };
  
  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth, User };
