import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { DemoState, useDemoContext } from './DemoContext';

type authenticatedState = 'loading' | 'authenticated' | 'unauthenticated';

type UserResp = {
  id: string;
  email: string;
  profile_picture?: string;
  username: string;
  streak: string;
  max_streak: string;
  score: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;

  startingStreak: number;
  maxStreak: number;
  startingScore: number;
};

type AuthContextType = {
  authenticatedState: authenticatedState;
  user: User | null;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [authenticatedState, setAuthenticatedState] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading');
  const { demoState } = useDemoContext();

  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    if (demoState !== DemoState.Normal && demoState !== DemoState.Asking) {
      return;
    }

    try {
      const response = await fetch(`/auth/user`);
      if (!response.ok) {
        setAuthenticatedState('unauthenticated');
        return;
      }

      const data: UserResp = await response.json();
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        avatarUrl: data.profile_picture || undefined,
        startingStreak: parseInt(data.streak, 10),
        maxStreak: parseInt(data.max_streak, 10),
        startingScore: parseInt(data.score, 10),
      });
      setAuthenticatedState('authenticated');
    } catch (error) {
      setAuthenticatedState('unauthenticated');
    }
  }, [demoState]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (demoState !== DemoState.Normal && demoState !== DemoState.Asking) {
      setUser({
        id: 'demo',
        username: 'Demo User',
        email: '',
        maxStreak: 3,
        startingScore: 0,
        avatarUrl: '/images/demo.jpg',
        startingStreak: 0,
      });
      setAuthenticatedState('authenticated');
    } else {
      if (user?.id === 'demo') {
        window.location.reload();
      }
    }
  }, [demoState]);

  return (
    <AuthContext.Provider
      value={{ authenticatedState, user, refreshUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
