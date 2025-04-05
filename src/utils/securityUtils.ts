// Security utilities for REMIX.AI

import * as crypto from 'crypto';

// Token management for secure API access
export class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  
  private constructor() {}
  
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    
    return TokenManager.instance;
  }
  
  // Set token with expiry
  setToken(token: string, expiresInSeconds: number): void {
    this.token = token;
    this.tokenExpiry = Date.now() + (expiresInSeconds * 1000);
  }
  
  // Get current token if valid
  getToken(): string | null {
    if (!this.token || Date.now() > this.tokenExpiry) {
      return null;
    }
    
    return this.token;
  }
  
  // Check if token is valid
  isTokenValid(): boolean {
    return !!this.getToken();
  }
  
  // Clear token
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }
}

// Secure storage utility for sensitive data
export class SecureStorage {
  private static instance: SecureStorage;
  private storage: Map<string, string> = new Map();
  private encryptionKey: string | null = null;
  
  private constructor() {}
  
  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    
    return SecureStorage.instance;
  }
  
  // Initialize with encryption key
  initialize(key: string): void {
    this.encryptionKey = key;
  }
  
  // Store encrypted data
  setItem(key: string, value: string): boolean {
    if (!this.encryptionKey) {
      console.error('SecureStorage not initialized with encryption key');
      return false;
    }
    
    try {
      const encryptedValue = this.encrypt(value);
      this.storage.set(key, encryptedValue);
      return true;
    } catch (error) {
      console.error('Error storing encrypted data:', error);
      return false;
    }
  }
  
  // Retrieve and decrypt data
  getItem(key: string): string | null {
    if (!this.encryptionKey) {
      console.error('SecureStorage not initialized with encryption key');
      return null;
    }
    
    const encryptedValue = this.storage.get(key);
    
    if (!encryptedValue) {
      return null;
    }
    
    try {
      return this.decrypt(encryptedValue);
    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      return null;
    }
  }
  
  // Remove item
  removeItem(key: string): void {
    this.storage.delete(key);
  }
  
  // Clear all storage
  clear(): void {
    this.storage.clear();
  }
  
  // Encrypt data
  private encrypt(text: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }
  
  // Decrypt data
  private decrypt(encryptedText: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Password utilities
export class PasswordUtils {
  // Generate a secure random password
  static generatePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
  
  // Check password strength
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string;
  } {
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length < 8) {
      feedback.push('Password is too short (minimum 8 characters)');
    } else {
      score += Math.min(2, Math.floor(password.length / 8));
    }
    
    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // Variety check
    const uniqueChars = new Set(password.split('')).size;
    score += Math.min(2, Math.floor(uniqueChars / 5));
    
    // Feedback based on score
    if (score < 3) {
      feedback.push('Password is weak. Add uppercase letters, numbers, and special characters.');
    } else if (score < 6) {
      feedback.push('Password is moderate. Consider adding more variety.');
    } else {
      feedback.push('Password is strong.');
    }
    
    return {
      score,
      feedback: feedback.join(' '),
    };
  }
  
  // Hash password (for demonstration - in production use bcrypt or similar)
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const useSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, useSalt, 10000, 64, 'sha512').toString('hex');
    
    return {
      hash,
      salt: useSalt,
    };
  }
  
  // Verify password
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return verifyHash === hash;
  }
}

// Input sanitization to prevent XSS and injection attacks
export class InputSanitizer {
  // Sanitize text input
  static sanitizeText(input: string): string {
    if (!input) return '';
    
    // Replace potentially dangerous characters
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // Sanitize HTML content
  static sanitizeHTML(html: string): string {
    if (!html) return '';
    
    // Simple HTML sanitization (for production, use a dedicated library like DOMPurify)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .replace(/on\w+=\w+/g, '');
  }
  
  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  // Validate URL format
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Rate limiting utility to prevent abuse
export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, { count: number; resetTime: number }> = new Map();
  
  private constructor() {}
  
  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    
    return RateLimiter.instance;
  }
  
  // Check if action is allowed
  checkLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const limitInfo = this.limits.get(key);
    
    // If no existing limit or window expired, create new limit
    if (!limitInfo || now > limitInfo.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }
    
    // If under limit, increment and allow
    if (limitInfo.count < maxAttempts) {
      limitInfo.count++;
      return true;
    }
    
    // Over limit, deny
    return false;
  }
  
  // Get remaining attempts
  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const limitInfo = this.limits.get(key);
    
    if (!limitInfo || now > limitInfo.resetTime) {
      return Infinity;
    }
    
    return Math.max(0, limitInfo.count);
  }
  
  // Get time until reset
  getTimeUntilReset(key: string): number {
    const now = Date.now();
    const limitInfo = this.limits.get(key);
    
    if (!limitInfo || now > limitInfo.resetTime) {
      return 0;
    }
    
    return limitInfo.resetTime - now;
  }
  
  // Reset limit for a key
  resetLimit(key: string): void {
    this.limits.delete(key);
  }
}

// CSRF protection utility
export class CSRFProtection {
  private static instance: CSRFProtection;
  private token: string | null = null;
  
  private constructor() {}
  
  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    
    return CSRFProtection.instance;
  }
  
  // Generate a new CSRF token
  generateToken(): string {
    this.token = crypto.randomBytes(32).toString('hex');
    return this.token;
  }
  
  // Get current token
  getToken(): string {
    if (!this.token) {
      return this.generateToken();
    }
    
    return this.token;
  }
  
  // Validate token
  validateToken(token: string): boolean {
    return token === this.token;
  }
}

// Export all security utilities
export default {
  TokenManager: TokenManager.getInstance(),
  SecureStorage: SecureStorage.getInstance(),
  PasswordUtils,
  InputSanitizer,
  RateLimiter: RateLimiter.getInstance(),
  CSRFProtection: CSRFProtection.getInstance(),
};
