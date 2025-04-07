# REMIX.AI Developer Guide

This guide provides comprehensive information for developers working on the REMIX.AI project. It covers development setup, coding standards, best practices, and troubleshooting.

## Development Environment Setup

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Expo CLI (`npm install -g expo-cli`)
- React Native development environment

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/remix-ai.git
   cd remix-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   CLAUDE_API_KEY=your_claude_api_key
   WEBSOCKET_URL=your_websocket_url
   VECTOR_STORE_API_KEY=your_vector_store_api_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
/src
  /components        # React components
  /services          # Service implementations
    /claude          # Claude AI integration
    /implementations # Service implementations
  /state             # State management
  /core              # Core utilities
  /screens           # Screen components
  /tests             # Test files
/docs                # Documentation
/assets              # Static assets
```

## Coding Standards

### General Guidelines

- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks for React components
- Use async/await for asynchronous code
- Write unit tests for all new code

### Naming Conventions

- **Files**: Use PascalCase for component files, camelCase for utility files
- **Components**: Use PascalCase for component names
- **Functions**: Use camelCase for function names
- **Variables**: Use camelCase for variable names
- **Constants**: Use UPPER_SNAKE_CASE for constants
- **Interfaces/Types**: Use PascalCase prefixed with 'I' for interfaces (e.g., `IUser`)
- **Events**: Use colon-separated namespaces (e.g., `audio:playback:start`)

### Code Organization

- Group related functionality in the same directory
- Keep components small and focused on a single responsibility
- Extract reusable logic into custom hooks
- Use the service locator pattern for accessing services

## Component Development

### Creating a New Component

1. Create a new file in the appropriate directory:
   ```tsx
   // src/components/MyComponent.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';

   interface MyComponentProps {
     title: string;
   }

   const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
     return (
       <View style={styles.container}>
         <Text style={styles.title}>{title}</Text>
       </View>
     );
   };

   const styles = StyleSheet.create({
     container: {
       padding: 16,
     },
     title: {
       fontSize: 18,
       fontWeight: 'bold',
     },
   });

   export default MyComponent;
   ```

2. Export the component from the index file:
   ```tsx
   // src/components/index.ts
   export { default as MyComponent } from './MyComponent';
   ```

### Using Services in Components

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ServiceLocator } from '../services/serviceLocator';
import { ClaudeService } from '../services/types';

const ClaudeDemo: React.FC = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResponse = async () => {
      setLoading(true);
      try {
        const claudeService = ServiceLocator.getInstance().get<ClaudeService>('claudeService');
        const result = await claudeService.generateCompletion('Create a techno beat');
        setResponse(result.message.content);
      } catch (error) {
        console.error('Error fetching response:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, []);

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Text>{response}</Text>
      )}
    </View>
  );
};

export default ClaudeDemo;
```

### Using the Event Bus

```tsx
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { eventBus } from '../services/eventBus';

const EventDemo: React.FC = () => {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('demo:event', (payload) => {
      console.log('Event received:', payload);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePress = () => {
    eventBus.publish('demo:event', { message: 'Button pressed' });
  };

  return (
    <View>
      <Button title="Publish Event" onPress={handlePress} />
    </View>
  );
};

export default EventDemo;
```

## Service Development

### Creating a New Service

1. Define the service interface:
   ```typescript
   // src/services/types.ts
   export interface MyService {
     doSomething(): Promise<void>;
     getData(): Promise<any>;
   }
   ```

2. Implement the service:
   ```typescript
   // src/services/implementations/realMyService.ts
   import { MyService } from '../types';
   import { eventBus } from '../eventBus';
   import { errorHandler, ErrorCategory, ErrorSeverity } from '../../core/errorHandling';

   export class RealMyService implements MyService {
     async doSomething(): Promise<void> {
       try {
         // Implementation
         eventBus.publish('myservice:something:done', {});
       } catch (error) {
         errorHandler.captureException(
           error instanceof Error ? error : new Error('Failed to do something'),
           ErrorCategory.SERVICE,
           ErrorSeverity.ERROR
         );
         throw error;
       }
     }

     async getData(): Promise<any> {
       try {
         // Implementation
         return { data: 'example' };
       } catch (error) {
         errorHandler.captureException(
           error instanceof Error ? error : new Error('Failed to get data'),
           ErrorCategory.SERVICE,
           ErrorSeverity.ERROR
         );
         throw error;
       }
     }
   }

   // Factory function
   export function createMyService(): MyService {
     return new RealMyService();
   }
   ```

3. Register the service:
   ```typescript
   // src/services/serviceLocator.ts
   import { createMyService } from './implementations/realMyService';

   // In the initialize method
   this.register('myService', createMyService());
   ```

## Testing

### Unit Testing

We use Jest for unit testing. Create test files with the `.test.ts` or `.test.tsx` extension.

```typescript
// src/services/implementations/__tests__/realMyService.test.ts
import { RealMyService } from '../realMyService';
import { eventBus } from '../../eventBus';
import { errorHandler } from '../../../core/errorHandling';

// Mock dependencies
jest.mock('../../eventBus', () => ({
  eventBus: {
    publish: jest.fn(),
  },
}));

jest.mock('../../../core/errorHandling', () => ({
  errorHandler: {
    captureException: jest.fn(),
  },
  ErrorCategory: {
    SERVICE: 'service',
  },
  ErrorSeverity: {
    ERROR: 'error',
  },
}));

describe('RealMyService', () => {
  let service: RealMyService;

  beforeEach(() => {
    service = new RealMyService();
    jest.clearAllMocks();
  });

  describe('doSomething', () => {
    it('should publish an event when successful', async () => {
      await service.doSomething();
      expect(eventBus.publish).toHaveBeenCalledWith('myservice:something:done', {});
    });

    it('should handle errors properly', async () => {
      // Mock implementation to throw an error
      jest.spyOn(service as any, 'doSomething').mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(service.doSomething()).rejects.toThrow('Test error');
      expect(errorHandler.captureException).toHaveBeenCalled();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Debugging

### React Native Debugging

1. Shake the device or press `Cmd+D` (iOS) or `Cmd+M` (Android) in the simulator
2. Select "Debug JS Remotely" to open the Chrome DevTools

### Logging

Use the following logging patterns:

```typescript
// For development logging
console.log('Debug info:', data);

// For errors
console.error('Error occurred:', error);

// For warnings
console.warn('Warning:', message);
```

### Error Handling

Use the error handling service for capturing and reporting errors:

```typescript
try {
  // Code that might throw
} catch (error) {
  errorHandler.captureException(
    error instanceof Error ? error : new Error('Unknown error'),
    ErrorCategory.UI,
    ErrorSeverity.ERROR,
    { componentName: 'MyComponent' }
  );
}
```

## Performance Optimization

### Memoization

Use memoization for expensive computations:

```typescript
import { useMemoizedComputation } from '../core/optimizations';

function MyComponent({ data }) {
  const processedData = useMemoizedComputation(() => {
    // Expensive computation
    return data.map(item => item * 2);
  }, [data]);

  // ...
}
```

### Debouncing and Throttling

Use debouncing for events that fire frequently:

```typescript
import { useDebounce, useThrottle } from '../core/optimizations';

function MyComponent() {
  const debouncedSave = useDebounce(() => {
    // Save data
  }, 500);

  const throttledUpdate = useThrottle(() => {
    // Update UI
  }, 100);

  // ...
}
```

### Memory Management

Use proper cleanup in useEffect:

```typescript
useEffect(() => {
  const subscription = eventBus.subscribe('event', handler);
  
  return () => {
    subscription();
  };
}, []);
```

## Deployment

### Building for Production

```bash
# Build for web
npm run build:web

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

### Environment Configuration

Create environment-specific configuration files:

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

## Troubleshooting

### Common Issues

#### "Cannot find module" errors

1. Check that the module is installed: `npm list <module-name>`
2. Try reinstalling node modules: `rm -rf node_modules && npm install`
3. Check import paths for typos

#### React Native build errors

1. Clear the React Native cache: `npm start -- --reset-cache`
2. Rebuild the project: `npm run clean && npm run build`

#### API connection issues

1. Check that API keys are correctly set in the environment variables
2. Verify network connectivity
3. Check API endpoint URLs for correctness

### Getting Help

If you encounter issues not covered in this guide:

1. Check the GitHub issues for similar problems
2. Ask in the #remix-ai-dev Slack channel
3. Contact the project maintainers

## Contributing

### Pull Request Process

1. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them: `git commit -m "Add your feature"`
3. Push to your branch: `git push origin feature/your-feature-name`
4. Create a pull request on GitHub
5. Wait for code review and address any feedback

### Code Review Guidelines

- All code must be reviewed by at least one other developer
- Tests must pass before merging
- Code must follow the project's coding standards
- Documentation must be updated for any API changes

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
