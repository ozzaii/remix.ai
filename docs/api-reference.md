# REMIX.AI API Reference

This document provides a comprehensive reference for all APIs and services in the REMIX.AI application.

## Table of Contents

1. [Claude Service API](#claude-service-api)
2. [Audio Engine API](#audio-engine-api)
3. [TeknoVault Service API](#teknovault-service-api)
4. [WebSocket Service API](#websocket-service-api)
5. [Vector Store Service API](#vector-store-service-api)
6. [Event Bus API](#event-bus-api)
7. [Error Handling API](#error-handling-api)
8. [State Management API](#state-management-api)

## Claude Service API

The Claude Service provides integration with Claude AI for generating music patterns and responding to user queries.

### Methods

#### `generateCompletion(prompt, options)`

Generates a completion from Claude AI.

**Parameters:**
- `prompt` (string): The prompt to send to Claude AI
- `options` (object, optional): Configuration options
  - `model` (string, optional): The Claude model to use (default: "claude-3-opus-20240229")
  - `temperature` (number, optional): Sampling temperature (default: 0.7)
  - `maxTokens` (number, optional): Maximum tokens to generate (default: 1000)
  - `systemPrompt` (string, optional): System prompt to use

**Returns:**
- Promise that resolves to a completion result object:
  ```javascript
  {
    id: string,
    model: string,
    message: {
      role: string,
      content: string
    },
    usage: {
      prompt_tokens: number,
      completion_tokens: number,
      total_tokens: number
    }
  }
  ```

**Example:**
```javascript
const claudeService = ServiceLocator.getInstance().get('claudeService');
const result = await claudeService.generateCompletion(
  'Create a techno beat with heavy kicks and synth stabs',
  {
    temperature: 0.8,
    systemPrompt: 'You are a music production assistant.'
  }
);
```

#### `generateStreamingCompletion(prompt, onChunk, options)`

Generates a streaming completion from Claude AI.

**Parameters:**
- `prompt` (string): The prompt to send to Claude AI
- `onChunk` (function): Callback function that receives each chunk of the response
- `options` (object, optional): Configuration options (same as `generateCompletion`)

**Returns:**
- Promise that resolves when the streaming is complete

**Example:**
```javascript
const claudeService = ServiceLocator.getInstance().get('claudeService');
await claudeService.generateStreamingCompletion(
  'Create a techno beat with heavy kicks and synth stabs',
  (chunk) => {
    console.log('Received chunk:', chunk);
    // Update UI with the chunk
  },
  {
    temperature: 0.8,
    systemPrompt: 'You are a music production assistant.'
  }
);
```

### Events

- `claude:request:start`: Fired when a request is sent to Claude AI
- `claude:request:complete`: Fired when a response is received from Claude AI
- `claude:request:error`: Fired when an error occurs during a request

## Audio Engine API

The Audio Engine Service provides audio playback and manipulation capabilities.

### Methods

#### `loadSample(id, url)`

Loads an audio sample.

**Parameters:**
- `id` (string): Unique identifier for the sample
- `url` (string): URL of the audio file

**Returns:**
- Promise that resolves when the sample is loaded

**Example:**
```javascript
const audioEngineService = ServiceLocator.getInstance().get('audioEngineService');
await audioEngineService.loadSample('kick', 'https://example.com/kick.wav');
```

#### `playSample(id)`

Plays a loaded sample.

**Parameters:**
- `id` (string): Identifier of the sample to play

**Example:**
```javascript
audioEngineService.playSample('kick');
```

#### `stopSample(id)`

Stops a playing sample.

**Parameters:**
- `id` (string): Identifier of the sample to stop

**Example:**
```javascript
audioEngineService.stopSample('kick');
```

#### `setBPM(bpm)`

Sets the beats per minute.

**Parameters:**
- `bpm` (number): BPM value (60-200)

**Example:**
```javascript
audioEngineService.setBPM(120);
```

#### `setSwing(amount)`

Sets the swing amount.

**Parameters:**
- `amount` (number): Swing amount (0-1)

**Example:**
```javascript
audioEngineService.setSwing(0.2);
```

#### `startPlayback()`

Starts playback of the current pattern.

**Example:**
```javascript
audioEngineService.startPlayback();
```

#### `stopPlayback()`

Stops playback.

**Example:**
```javascript
audioEngineService.stopPlayback();
```

#### `isPlaying()`

Checks if playback is active.

**Returns:**
- Boolean indicating if playback is active

**Example:**
```javascript
const isPlaying = audioEngineService.isPlaying();
```

#### `getCurrentStep()`

Gets the current step in the sequence.

**Returns:**
- Number representing the current step (0-63, or -1 if not playing)

**Example:**
```javascript
const currentStep = audioEngineService.getCurrentStep();
```

### Events

- `audio:sample:loaded`: Fired when a sample is loaded
- `audio:sample:playing`: Fired when a sample starts playing
- `audio:sample:stopped`: Fired when a sample is stopped
- `audio:sample:ended`: Fired when a sample playback ends naturally
- `audio:bpm:changed`: Fired when the BPM is changed
- `audio:swing:changed`: Fired when the swing amount is changed
- `audio:playback:start`: Fired when playback starts
- `audio:playback:stop`: Fired when playback stops
- `audio:step:change`: Fired when the current step changes

## TeknoVault Service API

The TeknoVault Service manages sound packs and samples.

### Methods

#### `getSoundPacks()`

Gets all available sound packs.

**Returns:**
- Promise that resolves to an array of sound pack objects

**Example:**
```javascript
const teknoVaultService = ServiceLocator.getInstance().get('teknoVaultService');
const soundPacks = await teknoVaultService.getSoundPacks();
```

#### `getSoundPack(id)`

Gets a specific sound pack.

**Parameters:**
- `id` (string): Identifier of the sound pack

**Returns:**
- Promise that resolves to a sound pack object

**Example:**
```javascript
const soundPack = await teknoVaultService.getSoundPack('techno-essentials');
```

#### `loadSoundPack(id)`

Loads a sound pack into memory.

**Parameters:**
- `id` (string): Identifier of the sound pack

**Returns:**
- Promise that resolves when the sound pack is loaded

**Example:**
```javascript
await teknoVaultService.loadSoundPack('techno-essentials');
```

#### `getSamples(packId)`

Gets all samples in a sound pack.

**Parameters:**
- `packId` (string): Identifier of the sound pack

**Returns:**
- Promise that resolves to an array of sample objects

**Example:**
```javascript
const samples = await teknoVaultService.getSamples('techno-essentials');
```

#### `getSample(packId, sampleId)`

Gets a specific sample.

**Parameters:**
- `packId` (string): Identifier of the sound pack
- `sampleId` (string): Identifier of the sample

**Returns:**
- Promise that resolves to a sample object

**Example:**
```javascript
const sample = await teknoVaultService.getSample('techno-essentials', 'kick-1');
```

### Events

- `teknovault:pack:loading`: Fired when a sound pack starts loading
- `teknovault:pack:loaded`: Fired when a sound pack is loaded
- `teknovault:pack:error`: Fired when an error occurs loading a sound pack
- `teknovault:sample:loaded`: Fired when a sample is loaded
- `teknovault:pack:deploying`: Fired when a sound pack is being deployed

## WebSocket Service API

The WebSocket Service provides real-time communication capabilities.

### Methods

#### `connect()`

Connects to the WebSocket server.

**Example:**
```javascript
const webSocketService = ServiceLocator.getInstance().get('webSocketService');
webSocketService.connect();
```

#### `disconnect()`

Disconnects from the WebSocket server.

**Example:**
```javascript
webSocketService.disconnect();
```

#### `send(type, payload)`

Sends a message to the WebSocket server.

**Parameters:**
- `type` (string): Message type
- `payload` (any): Message payload

**Returns:**
- Boolean indicating if the message was sent successfully

**Example:**
```javascript
webSocketService.send('beat:update', { id: 'my-beat', patterns: [...] });
```

#### `addMessageListener(type, listener)`

Adds a listener for a specific message type.

**Parameters:**
- `type` (string): Message type to listen for
- `listener` (function): Callback function that receives the message payload

**Returns:**
- Function to remove the listener

**Example:**
```javascript
const unsubscribe = webSocketService.addMessageListener('beat:update', (payload) => {
  console.log('Beat updated:', payload);
});

// Later, to unsubscribe
unsubscribe();
```

#### `addConnectionStateListener(listener)`

Adds a listener for connection state changes.

**Parameters:**
- `listener` (function): Callback function that receives the connection state

**Returns:**
- Function to remove the listener

**Example:**
```javascript
const unsubscribe = webSocketService.addConnectionStateListener((state) => {
  console.log('Connection state:', state);
});

// Later, to unsubscribe
unsubscribe();
```

#### `getConnectionState()`

Gets the current connection state.

**Returns:**
- String representing the connection state ('disconnected', 'connecting', 'connected', 'reconnecting', 'failed')

**Example:**
```javascript
const state = webSocketService.getConnectionState();
```

### Events

- `websocket:connecting`: Fired when connecting to the WebSocket server
- `websocket:connected`: Fired when connected to the WebSocket server
- `websocket:disconnected`: Fired when disconnected from the WebSocket server
- `websocket:reconnecting`: Fired when reconnecting to the WebSocket server
- `websocket:failed`: Fired when connection to the WebSocket server fails
- `websocket:message`: Fired when a message is received from the WebSocket server

## Vector Store Service API

The Vector Store Service provides semantic search and retrieval capabilities.

### Methods

#### `addDocument(id, text, metadata)`

Adds a document to the vector store.

**Parameters:**
- `id` (string): Unique identifier for the document
- `text` (string): Text content of the document
- `metadata` (object, optional): Additional metadata for the document

**Returns:**
- Promise that resolves when the document is added

**Example:**
```javascript
const vectorStoreService = ServiceLocator.getInstance().get('vectorStoreService');
await vectorStoreService.addDocument(
  'beat-1',
  'Techno beat with heavy kicks and synth stabs',
  { category: 'techno', bpm: 130 }
);
```

#### `search(query, limit)`

Searches for documents similar to the query.

**Parameters:**
- `query` (string): Search query
- `limit` (number, optional): Maximum number of results to return (default: 5)

**Returns:**
- Promise that resolves to an array of search result objects:
  ```javascript
  {
    id: string,
    score: number,
    metadata?: object
  }
  ```

**Example:**
```javascript
const results = await vectorStoreService.search('techno beat with synth', 5);
```

#### `getDocument(id)`

Gets a document by ID.

**Parameters:**
- `id` (string): Document ID

**Returns:**
- Promise that resolves to a document object or null if not found:
  ```javascript
  {
    text: string,
    metadata?: object
  }
  ```

**Example:**
```javascript
const document = await vectorStoreService.getDocument('beat-1');
```

#### `deleteDocument(id)`

Deletes a document.

**Parameters:**
- `id` (string): Document ID

**Returns:**
- Promise that resolves to a boolean indicating if the document was deleted

**Example:**
```javascript
const deleted = await vectorStoreService.deleteDocument('beat-1');
```

#### `clear()`

Clears all documents from the vector store.

**Example:**
```javascript
vectorStoreService.clear();
```

#### `getDocumentCount()`

Gets the number of documents in the vector store.

**Returns:**
- Number of documents

**Example:**
```javascript
const count = vectorStoreService.getDocumentCount();
```

### Events

- `vectorstore:document:added`: Fired when a document is added
- `vectorstore:document:deleted`: Fired when a document is deleted
- `vectorstore:search:completed`: Fired when a search is completed
- `vectorstore:cleared`: Fired when the vector store is cleared

## Event Bus API

The Event Bus provides a centralized event handling system.

### Methods

#### `publish(eventType, payload)`

Publishes an event.

**Parameters:**
- `eventType` (string): Type of the event
- `payload` (any): Event payload

**Example:**
```javascript
const eventBus = ServiceLocator.getInstance().get('eventBusService');
eventBus.publish('beat:created', {
  title: 'My Beat',
  bpm: 120,
  patterns: []
});
```

#### `subscribe(eventType, handler, options)`

Subscribes to an event.

**Parameters:**
- `eventType` (string): Type of the event to subscribe to
- `handler` (function): Callback function that receives the event payload
- `options` (object, optional): Subscription options
  - `priority` (number, optional): Handler priority (higher numbers execute first)
  - `filter` (function, optional): Function to filter events

**Returns:**
- Function to unsubscribe

**Example:**
```javascript
const unsubscribe = eventBus.subscribe(
  'beat:created',
  (payload) => {
    console.log('Beat created:', payload);
  },
  {
    priority: 10,
    filter: (event) => event.payload.bpm > 100
  }
);

// Later, to unsubscribe
unsubscribe();
```

#### `clear()`

Clears all event subscriptions.

**Example:**
```javascript
eventBus.clear();
```

## Error Handling API

The Error Handling service provides error capturing and reporting capabilities.

### Methods

#### `captureError(errorData)`

Captures an error.

**Parameters:**
- `errorData` (object): Error data
  - `message` (string): Error message
  - `category` (string): Error category
  - `severity` (string): Error severity ('info', 'warning', 'error', 'critical')
  - `timestamp` (number): Error timestamp
  - `metadata` (object, optional): Additional error metadata

**Returns:**
- Boolean indicating if the error was captured successfully

**Example:**
```javascript
const errorHandler = ServiceLocator.getInstance().get('errorHandlerService');
errorHandler.captureError({
  message: 'Failed to load sample',
  category: 'audio',
  severity: 'error',
  timestamp: Date.now(),
  metadata: { sampleId: 'kick' }
});
```

#### `captureException(error, category, severity, metadata)`

Captures an exception.

**Parameters:**
- `error` (Error): Error object
- `category` (string): Error category
- `severity` (string): Error severity ('info', 'warning', 'error', 'critical')
- `metadata` (object, optional): Additional error metadata

**Returns:**
- Boolean indicating if the exception was captured successfully

**Example:**
```javascript
try {
  // Some code that might throw
} catch (error) {
  errorHandler.captureException(
    error,
    'audio',
    'error',
    { sampleId: 'kick' }
  );
}
```

#### `addErrorListener(listener)`

Adds a listener for captured errors.

**Parameters:**
- `listener` (function): Callback function that receives the error data

**Returns:**
- Function to remove the listener

**Example:**
```javascript
const unsubscribe = errorHandler.addErrorListener((error) => {
  console.log('Error captured:', error);
});

// Later, to unsubscribe
unsubscribe();
```

### Events

- `error:captured`: Fired when an error is captured

## State Management API

The State Management service provides centralized state management.

### Methods

#### `getState()`

Gets the current state.

**Returns:**
- Current state object

**Example:**
```javascript
const stateManager = ServiceLocator.getInstance().get('stateManagerService');
const state = stateManager.getState();
```

#### `dispatch(action)`

Dispatches an action to update the state.

**Parameters:**
- `action` (object): Action object
  - `type` (string): Action type
  - `payload` (any): Action payload

**Example:**
```javascript
stateManager.dispatch({
  type: 'beats/createBeat',
  payload: {
    title: 'My Beat',
    bpm: 120,
    patterns: []
  }
});
```

#### `subscribe(listener)`

Subscribes to state changes.

**Parameters:**
- `listener` (function): Callback function that receives the new state

**Returns:**
- Function to unsubscribe

**Example:**
```javascript
const unsubscribe = stateManager.subscribe((state) => {
  console.log('State updated:', state);
});

// Later, to unsubscribe
unsubscribe();
```

### React Hooks

#### `useSelector(selector)`

Selects a part of the state.

**Parameters:**
- `selector` (function): Function that receives the state and returns a part of it

**Returns:**
- Selected part of the state

**Example:**
```javascript
import { useSelector } from '../state';

function BeatList() {
  const beats = useSelector(state => state.beats.patterns);
  
  return (
    <div>
      {beats.map(beat => (
        <div key={beat.id}>{beat.title}</div>
      ))}
    </div>
  );
}
```

#### `useDispatch()`

Gets the dispatch function.

**Returns:**
- Dispatch function

**Example:**
```javascript
import { useDispatch } from '../state';

function CreateBeatButton() {
  const dispatch = useDispatch();
  
  const handleClick = () => {
    dispatch({
      type: 'beats/createBeat',
      payload: {
        title: 'New Beat',
        bpm: 120,
        patterns: []
      }
    });
  };
  
  return (
    <button onClick={handleClick}>Create Beat</button>
  );
}
```

### Events

- `state:changed`: Fired when the state changes
- `state:action:dispatched`: Fired when an action is dispatched
