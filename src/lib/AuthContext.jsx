import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { currentUser, logout as doLogout } from '@/api/auth';

const AuthContext = createContext({ user: null, loading: true, refresh: () => {}, signOut: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const u = await currentUser();
    setUser(u);
    setLoading(false);
    return u;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await doLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
