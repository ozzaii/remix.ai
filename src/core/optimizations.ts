/**
 * Production Optimizations for REMIX.AI
 * 
 * This file implements various optimizations to improve performance,
 * reliability, and resource usage in production environments.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { eventBus } from '../services/eventBus';

/**
 * Memoization utility for expensive computations
 * @param compute Function that performs the computation
 * @param deps Dependencies that should trigger recomputation
 * @returns Memoized result
 */
export function useMemoizedComputation<T>(compute: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; result: T } | null>(null);
  
  // Check if dependencies have changed
  const depsChanged = !ref.current || !depsEqual(deps, ref.current.deps);
  
  if (depsChanged) {
    ref.current = {
      deps,
      result: compute()
    };
  }
  
  return ref.current.result;
}

/**
 * Compare dependency arrays for equality
 */
function depsEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  
  return true;
}

/**
 * Debounce a function call
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);
}

/**
 * Throttle a function call
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const argsRef = useRef<Parameters<T> | null>(null);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const elapsed = now - lastRunRef.current;
    
    argsRef.current = args;
    
    if (elapsed >= limit) {
      lastRunRef.current = now;
      fn(...args);
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        timeoutRef.current = null;
        
        if (argsRef.current) {
          fn(...argsRef.current);
        }
      }, limit - elapsed);
    }
  }, [fn, limit]);
}

/**
 * Hook for resource cleanup
 * @param resource Resource to clean up
 * @param cleanup Cleanup function
 */
export function useResourceCleanup<T>(
  resource: T | null | undefined,
  cleanup: (resource: T) => void
): void {
  const resourceRef = useRef<T | null | undefined>(null);
  
  useEffect(() => {
    resourceRef.current = resource;
    
    return () => {
      if (resourceRef.current) {
        cleanup(resourceRef.current);
      }
    };
  }, [resource, cleanup]);
}

/**
 * Hook for error boundary in functional components
 */
export function useErrorBoundary(): {
  error: Error | null;
  resetError: () => void;
  ErrorFallback: React.FC<{ children: React.ReactNode }>;
} {
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      setError(event.error || new Error('Unknown error occurred'));
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  const ErrorFallback: React.FC<{ children: React.ReactNode }> = useCallback(
    ({ children }) => {
      if (error) {
        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{error.message}</p>
            <button onClick={resetError}>Try again</button>
          </div>
        );
      }
      
      return <>{children}</>;
    },
    [error, resetError]
  );
  
  return { error, resetError, ErrorFallback };
}

/**
 * Hook for performance monitoring
 * @param componentName Name of the component to monitor
 */
export function usePerformanceMonitoring(componentName: string): void {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  
  useEffect(() => {
    const renderCount = ++renderCountRef.current;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} rendered ${renderCount} times. ` +
        `Time since last render: ${timeSinceLastRender}ms`
      );
    }
    
    // Report to event bus for monitoring
    eventBus.publish('performance:render', {
      componentName,
      renderCount,
      timeSinceLastRender
    });
  });
}

/**
 * Hook for lazy loading components
 * @param factory Factory function that returns a promise resolving to a component
 * @returns Lazy loaded component and loading state
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): [React.ComponentType<React.ComponentProps<T>> | null, boolean] {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    factory()
      .then(module => {
        if (mounted) {
          setComponent(module.default);
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error lazy loading component:', error);
        if (mounted) {
          setIsLoading(false);
        }
      });
    
    return () => {
      mounted = false;
    };
  }, [factory]);
  
  return [Component, isLoading];
}

/**
 * Hook for optimized event handling
 * @param eventType Event type to subscribe to
 * @param handler Event handler
 * @param options Subscription options
 */
export function useOptimizedEventHandler<T>(
  eventType: string,
  handler: (payload: T) => void,
  options: { throttle?: number; debounce?: number } = {}
): void {
  const handlerRef = useRef(handler);
  
  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  
  useEffect(() => {
    let wrappedHandler: (payload: T) => void;
    
    if (options.throttle) {
      // Create throttled handler
      let lastRun = 0;
      wrappedHandler = (payload: T) => {
        const now = Date.now();
        if (now - lastRun >= options.throttle!) {
          lastRun = now;
          handlerRef.current(payload);
        }
      };
    } else if (options.debounce) {
      // Create debounced handler
      let timeoutId: NodeJS.Timeout | null = null;
      wrappedHandler = (payload: T) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          handlerRef.current(payload);
        }, options.debounce);
      };
    } else {
      // Use handler directly
      wrappedHandler = (payload: T) => {
        handlerRef.current(payload);
      };
    }
    
    // Subscribe to event
    const unsubscribe = eventBus.subscribe<T>(eventType, wrappedHandler);
    
    return unsubscribe;
  }, [eventType, options.throttle, options.debounce]);
}

/**
 * Hook for optimized rendering with requestAnimationFrame
 * @param callback Callback to run on animation frame
 * @param deps Dependencies that should trigger a new animation frame
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  deps: React.DependencyList = []
): void {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, deps);
}

/**
 * Utility for optimized audio processing
 */
export const AudioOptimizations = {
  /**
   * Create an optimized audio buffer
   * @param context Audio context
   * @param numberOfChannels Number of channels
   * @param length Buffer length
   * @param sampleRate Sample rate
   * @returns Optimized audio buffer
   */
  createOptimizedBuffer(
    context: AudioContext,
    numberOfChannels: number,
    length: number,
    sampleRate: number
  ): AudioBuffer {
    // Use shared array buffers for better performance when available
    const buffer = context.createBuffer(numberOfChannels, length, sampleRate);
    return buffer;
  },
  
  /**
   * Optimize audio node connections
   * @param nodes Array of audio nodes to connect in sequence
   * @returns The last node in the chain
   */
  connectNodes(nodes: AudioNode[]): AudioNode {
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1]);
    }
    return nodes[nodes.length - 1];
  },
  
  /**
   * Create an optimized worklet processor
   * @param context Audio context
   * @param processorName Processor name
   * @param processorCode Processor code
   * @returns Promise resolving when processor is added
   */
  async createWorkletProcessor(
    context: AudioContext,
    processorName: string,
    processorCode: string
  ): Promise<void> {
    const blob = new Blob([processorCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    try {
      await context.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

/**
 * Utility for memory management
 */
export const MemoryOptimizations = {
  /**
   * Clear object references
   * @param obj Object to clear
   */
  clearReferences(obj: Record<string, any>): void {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = null;
      }
    }
  },
  
  /**
   * Create a memory-efficient cache
   * @param maxSize Maximum cache size
   * @returns Cache object
   */
  createCache<K, V>(maxSize: number = 100): {
    get: (key: K) => V | undefined;
    set: (key: K, value: V) => void;
    clear: () => void;
  } {
    const cache = new Map<K, V>();
    
    return {
      get: (key: K) => cache.get(key),
      set: (key: K, value: V) => {
        if (cache.size >= maxSize) {
          // Remove oldest entry
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },
      clear: () => cache.clear()
    };
  }
};

/**
 * Utility for network optimizations
 */
export const NetworkOptimizations = {
  /**
   * Create a request queue to limit concurrent requests
   * @param maxConcurrent Maximum number of concurrent requests
   * @returns Request queue
   */
  createRequestQueue<T>(maxConcurrent: number = 4): {
    add: (request: () => Promise<T>) => Promise<T>;
    clear: () => void;
  } {
    const queue: Array<{
      request: () => Promise<T>;
      resolve: (value: T) => void;
      reject: (reason: any) => void;
    }> = [];
    let activeCount = 0;
    
    const processQueue = () => {
      if (queue.length === 0 || activeCount >= maxConcurrent) {
        return;
      }
      
      const { request, resolve, reject } = queue.shift()!;
      activeCount++;
      
      request()
        .then(result => {
          resolve(result);
          activeCount--;
          processQueue();
        })
        .catch(error => {
          reject(error);
          activeCount--;
          processQueue();
        });
    };
    
    return {
      add: (request: () => Promise<T>) => {
        return new Promise<T>((resolve, reject) => {
          queue.push({ request, resolve, reject });
          processQueue();
        });
      },
      clear: () => {
        queue.length = 0;
      }
    };
  }
};
