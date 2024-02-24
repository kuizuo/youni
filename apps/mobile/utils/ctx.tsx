import React from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = React.createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
  token?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  token: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useAuth() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useAuth must be wrapped in a <AuthProvider />');
    }
  }

  return value;
}

export function AuthProvider(props: React.PropsWithChildren) {
  const [[isLoading, token], setToken] = useStorageState('token');

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          // Perform sign-in logic here
          setToken(token);
        },
        signOut: () => {
          setToken(null);
        },
        token,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
