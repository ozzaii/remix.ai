import { User } from '../auth/AuthContext';
import { ParsedBeat } from '../beatParser/beatPatternParser';

// Define interfaces for social features

export interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  username: string;
  createdAt: string;
}

export interface SharedBeat {
  id: string;
  beatData: ParsedBeat;
  userId: string;
  username: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: Like[];
  comments: Comment[];
  playCount: number;
  isPublic: boolean;
}

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    username: 'djmaster',
    email: 'dj@example.com',
    createdAt: '2025-01-15T12:00:00Z',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    username: 'beatmaker',
    email: 'beat@example.com',
    createdAt: '2025-02-20T14:30:00Z',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    username: 'musiclover',
    email: 'music@example.com',
    createdAt: '2025-03-10T09:15:00Z',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

// Mock shared beats
const mockSharedBeats: SharedBeat[] = [
  {
    id: '1',
    beatData: {
      bpm: 128,
      instruments: {
        kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
        snare: Array(16).fill(false).map((_, i) => i % 8 === 4),
        hihat: Array(16).fill(false).map((_, i) => i % 2 === 0),
        bass: Array(16).fill(false).map((_, i) => i % 8 === 0 || i % 8 === 6),
      },
      effects: {
        reverb: 0.3,
        delay: 0.2,
      },
      metadata: {
        created: '2025-03-15T10:30:00Z',
        modified: '2025-03-15T10:30:00Z',
        name: 'Neon Nights',
      },
    },
    userId: '1',
    username: 'djmaster',
    title: 'Neon Nights',
    description: 'A synthwave inspired beat with heavy bass',
    tags: ['synthwave', 'electronic', 'bass'],
    createdAt: '2025-03-15T10:30:00Z',
    updatedAt: '2025-03-15T10:30:00Z',
    likes: [
      {
        id: '1',
        userId: '2',
        username: 'beatmaker',
        createdAt: '2025-03-15T11:45:00Z',
      },
      {
        id: '2',
        userId: '3',
        username: 'musiclover',
        createdAt: '2025-03-16T09:20:00Z',
      },
    ],
    comments: [
      {
        id: '1',
        text: 'Love the bass line!',
        userId: '2',
        username: 'beatmaker',
        createdAt: '2025-03-15T12:00:00Z',
      },
      {
        id: '2',
        text: 'Great vibe, would love to collaborate',
        userId: '3',
        username: 'musiclover',
        createdAt: '2025-03-16T10:15:00Z',
      },
    ],
    playCount: 42,
    isPublic: true,
  },
  {
    id: '2',
    beatData: {
      bpm: 95,
      instruments: {
        kick: Array(16).fill(false).map((_, i) => i % 4 === 0 || i % 16 === 10),
        snare: Array(16).fill(false).map((_, i) => i % 8 === 4),
        hihat: Array(16).fill(false).map((_, i) => i % 2 === 1),
        bass: Array(16).fill(false).map((_, i) => i % 4 === 0 || i % 4 === 3),
      },
      effects: {
        reverb: 0.4,
        delay: 0.3,
      },
      metadata: {
        created: '2025-03-20T15:45:00Z',
        modified: '2025-03-20T16:30:00Z',
        name: 'Chill Vibes',
      },
    },
    userId: '2',
    username: 'beatmaker',
    title: 'Chill Vibes',
    description: 'Relaxed hip-hop beat perfect for lofi study sessions',
    tags: ['lofi', 'hiphop', 'chill'],
    createdAt: '2025-03-20T16:30:00Z',
    updatedAt: '2025-03-20T16:30:00Z',
    likes: [
      {
        id: '3',
        userId: '1',
        username: 'djmaster',
        createdAt: '2025-03-21T08:15:00Z',
      },
    ],
    comments: [
      {
        id: '3',
        text: 'This is perfect for my next mix!',
        userId: '1',
        username: 'djmaster',
        createdAt: '2025-03-21T08:20:00Z',
      },
    ],
    playCount: 28,
    isPublic: true,
  },
];

class SocialService {
  private sharedBeats: SharedBeat[] = [...mockSharedBeats];
  private users: User[] = [...mockUsers];

  // Get all public shared beats
  getPublicBeats(): SharedBeat[] {
    return this.sharedBeats.filter(beat => beat.isPublic);
  }

  // Get beats by a specific user
  getUserBeats(userId: string): SharedBeat[] {
    return this.sharedBeats.filter(beat => beat.userId === userId);
  }

  // Get a specific beat by ID
  getBeatById(beatId: string): SharedBeat | undefined {
    return this.sharedBeats.find(beat => beat.id === beatId);
  }

  // Share a new beat
  shareBeat(
    userId: string,
    username: string,
    beatData: ParsedBeat,
    title: string,
    description: string,
    tags: string[],
    isPublic: boolean = true
  ): SharedBeat {
    const now = new Date().toISOString();
    
    const newBeat: SharedBeat = {
      id: Date.now().toString(),
      beatData,
      userId,
      username,
      title,
      description,
      tags,
      createdAt: now,
      updatedAt: now,
      likes: [],
      comments: [],
      playCount: 0,
      isPublic,
    };
    
    this.sharedBeats.push(newBeat);
    return newBeat;
  }

  // Update an existing beat
  updateBeat(
    beatId: string,
    userId: string,
    updates: Partial<{
      beatData: ParsedBeat;
      title: string;
      description: string;
      tags: string[];
      isPublic: boolean;
    }>
  ): SharedBeat | null {
    const beatIndex = this.sharedBeats.findIndex(beat => beat.id === beatId);
    
    if (beatIndex === -1) {
      return null;
    }
    
    const beat = this.sharedBeats[beatIndex];
    
    // Check if user owns the beat
    if (beat.userId !== userId) {
      return null;
    }
    
    // Update the beat
    const updatedBeat = {
      ...beat,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.sharedBeats[beatIndex] = updatedBeat;
    return updatedBeat;
  }

  // Delete a beat
  deleteBeat(beatId: string, userId: string): boolean {
    const beatIndex = this.sharedBeats.findIndex(beat => beat.id === beatId);
    
    if (beatIndex === -1) {
      return false;
    }
    
    const beat = this.sharedBeats[beatIndex];
    
    // Check if user owns the beat
    if (beat.userId !== userId) {
      return false;
    }
    
    // Remove the beat
    this.sharedBeats.splice(beatIndex, 1);
    return true;
  }

  // Like a beat
  likeBeat(beatId: string, userId: string, username: string): SharedBeat | null {
    const beatIndex = this.sharedBeats.findIndex(beat => beat.id === beatId);
    
    if (beatIndex === -1) {
      return null;
    }
    
    const beat = this.sharedBeats[beatIndex];
    
    // Check if user already liked the beat
    if (beat.likes.some(like => like.userId === userId)) {
      return beat;
    }
    
    // Add like
    const newLike: Like = {
      id: Date.now().toString(),
      userId,
      username,
      createdAt: new Date().toISOString(),
    };
    
    beat.likes.push(newLike);
    return beat;
  }

  // Unlike a beat
  unlikeBeat(beatId: string, userId: string): SharedBeat | null {
    const beatIndex = this.sharedBeats.findIndex(beat => beat.id === beatId);
    
    if (beatIndex === -1) {
      return null;
    }
    
    const beat = this.sharedBeats[beatIndex];
    
    // Remove like
    beat.likes = beat.likes.filter(like => like.userId !== userId);
    return beat;
  }

  // Add a comment to a beat
  addComment(
    beatId: string,
    userId: string,
    username: string,
    text: string
  ): SharedBeat | null {
    const beatIndex = this.sharedBeats.findIndex(beat => beat.id === beatId);
    
    if (beatIndex === -1) {
      return null;
    }
    
    const beat = this.sharedBeats[beatIndex];
    
    // Add comment
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      userId,
      username,
      createdAt: new Date().toISOString(),
    };
    
    beat.comments.push(newComment);
    return beat;
  }

  // Delete a comment
  deleteComment(
    beatId: string,
    commentId: string,
    userId: string
  ): SharedBeat | null {
    const beatIndex = this.sharedBeats.findIndex(beat => beat.id === beatId);
    
    if (beatIndex === -1) {
      return null;
    }
    
    const beat = this.sharedBeats[beatIndex];
    
    // Find the comment
    const commentIndex = beat.comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      return null;
    }
    
    const comment = beat.comments[commentIndex];
    
    // Check if user owns the comment or the beat
    if (comment.userId !== userId && beat.userId !== userId) {
      return null;
    }
    
    // Remove the comment
    beat.comments.splice(commentIndex, 1);
    return beat;
  }

  // Increment play count
  incrementPlayCount(beatId: string): SharedBeat | null {
    const beatIndex = this.sharedBeats.findIndex(beat => beat.id === beatId);
    
    if (beatIndex === -1) {
      return null;
    }
    
    const beat = this.sharedBeats[beatIndex];
    beat.playCount += 1;
    return beat;
  }

  // Search beats by title, description, or tags
  searchBeats(query: string): SharedBeat[] {
    const lowerQuery = query.toLowerCase();
    
    return this.sharedBeats.filter(beat => {
      return (
        beat.isPublic &&
        (beat.title.toLowerCase().includes(lowerQuery) ||
          beat.description.toLowerCase().includes(lowerQuery) ||
          beat.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    });
  }

  // Get trending beats (based on play count and likes)
  getTrendingBeats(limit: number = 10): SharedBeat[] {
    return [...this.sharedBeats]
      .filter(beat => beat.isPublic)
      .sort((a, b) => {
        const aScore = a.playCount + a.likes.length * 2;
        const bScore = b.playCount + b.likes.length * 2;
        return bScore - aScore;
      })
      .slice(0, limit);
  }
}

export default new SocialService();
