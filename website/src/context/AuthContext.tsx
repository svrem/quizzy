import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/auth/user`).catch((error) => null);
      if (!response || !response.ok) {
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
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
