import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player } from '@workspace/api-client-react';
import { useGetMe } from '@workspace/api-client-react';

interface AuthContextValue {
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { data: meData, isLoading, error } = useGetMe({ query: { retry: false } });

  useEffect(() => {
    if (meData) {
      setCurrentPlayer(meData);
    } else if (error) {
      setCurrentPlayer(null);
    }
  }, [meData, error]);

  return (
    <AuthContext.Provider value={{ currentPlayer, setCurrentPlayer, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
