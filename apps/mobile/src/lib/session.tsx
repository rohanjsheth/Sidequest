import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { clearToken, getToken, setToken , api} from '@/lib/api';

export type SessionUser = { id: string; name: string | null } | null;

type SessionValue = {
  token: string | null;
  user: SessionUser;
  isLoading: boolean;
  signIn: (token: string, user: SessionUser) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: SessionUser) => void;
};

const SessionContext = createContext<SessionValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await getToken();
      if (saved)
      {
        try {
          const { user } = await api<{ user: SessionUser }>('/me', {auth: true});
          setTokenState(saved);
          setUser(user);
        }
        catch {
          await clearToken();
        }   
      }
      setIsLoading(false);
      
    })();
  }, []);

  async function signIn(newToken: string, newUser: SessionUser) {
    await setToken(newToken);
    setTokenState(newToken);
    setUser(newUser)
  }

  async function signOut() {
    await clearToken();
    setTokenState(null);
    setUser(null);
  }

  return (
    <SessionContext.Provider
      value={{ token, user, isLoading, signIn, signOut, setUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
