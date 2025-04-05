// Performance optimization utilities for REMIX.AI

// Memoization utility for expensive calculations
export function memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
  const cache = new Map();
  
  return (...args: any[]): T => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Debounce utility to prevent excessive function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility to limit function call frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Batch processing utility for handling multiple operations efficiently
export function batchProcess<T, R>(
  items: T[],
  processFn: (item: T) => R,
  batchSize: number = 10
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = [];
    let index = 0;
    
    function processNextBatch() {
      const batch = items.slice(index, index + batchSize);
      index += batchSize;
      
      if (batch.length === 0) {
        resolve(results);
        return;
      }
      
      try {
        const batchResults = batch.map(processFn);
        results.push(...batchResults);
        
        // Use setTimeout to avoid blocking the main thread
        setTimeout(processNextBatch, 0);
      } catch (error) {
        reject(error);
      }
    }
    
    processNextBatch();
  });
}

// Cache utility for storing and retrieving data with expiration
export class Cache<T> {
  private cache: Map<string, { value: T; expiry: number }> = new Map();
  
  constructor(private defaultTTL: number = 5 * 60 * 1000) {} // Default 5 minutes
  
  set(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Audio buffer cache to prevent reloading audio samples
export class AudioBufferCache {
  private static instance: AudioBufferCache;
  private cache: Cache<AudioBuffer>;
  
  private constructor() {
    this.cache = new Cache<AudioBuffer>(30 * 60 * 1000); // 30 minutes TTL
    
    // Clean up expired items every 5 minutes
    setInterval(() => {
      this.cache.cleanup();
    }, 5 * 60 * 1000);
  }
  
  static getInstance(): AudioBufferCache {
    if (!AudioBufferCache.instance) {
      AudioBufferCache.instance = new AudioBufferCache();
    }
    
    return AudioBufferCache.instance;
  }
  
  getBuffer(key: string): AudioBuffer | null {
    return this.cache.get(key);
  }
  
  setBuffer(key: string, buffer: AudioBuffer): void {
    this.cache.set(key, buffer);
  }
  
  hasBuffer(key: string): boolean {
    return this.cache.has(key);
  }
}

// Image asset preloader
export class ImagePreloader {
  private static instance: ImagePreloader;
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  
  private constructor() {}
  
  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    
    return ImagePreloader.instance;
  }
  
  preload(url: string): Promise<HTMLImageElement> {
    if (this.loadedImages.has(url)) {
      return Promise.resolve(this.loadedImages.get(url)!);
    }
    
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }
    
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.set(url, img);
        this.loadingPromises.delete(url);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
    
    this.loadingPromises.set(url, promise);
    return promise;
  }
  
  preloadMultiple(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.preload(url)));
  }
  
  getImage(url: string): HTMLImageElement | undefined {
    return this.loadedImages.get(url);
  }
}

// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, { count: number; totalTime: number; min: number; max: number }> = new Map();
  
  private constructor() {}
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    
    return PerformanceMonitor.instance;
  }
  
  // Measure execution time of a function
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    this.recordMetric(name, duration);
    
    return result;
  }
  
  // Measure execution time of an async function
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    this.recordMetric(name, duration);
    
    return result;
  }
  
  // Record a metric
  private recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        count: 0,
        totalTime: 0,
        min: Infinity,
        max: -Infinity,
      });
    }
    
    const metric = this.metrics.get(name)!;
    metric.count++;
    metric.totalTime += duration;
    metric.min = Math.min(metric.min, duration);
    metric.max = Math.max(metric.max, duration);
  }
  
  // Get metrics report
  getMetrics(): Record<string, { count: number; avgTime: number; minTime: number; maxTime: number }> {
    const report: Record<string, { count: number; avgTime: number; minTime: number; maxTime: number }> = {};
    
    for (const [name, metric] of this.metrics.entries()) {
      report[name] = {
        count: metric.count,
        avgTime: metric.totalTime / metric.count,
        minTime: metric.min,
        maxTime: metric.max,
      };
    }
    
    return report;
  }
  
  // Reset metrics
  reset(): void {
    this.metrics.clear();
  }
}

// Export all utilities
export default {
  memoize,
  debounce,
  throttle,
  batchProcess,
  Cache,
  AudioBufferCache: AudioBufferCache.getInstance(),
  ImagePreloader: ImagePreloader.getInstance(),
  PerformanceMonitor: PerformanceMonitor.getInstance(),
};
