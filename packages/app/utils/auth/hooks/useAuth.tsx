import React from 'react';

export interface Credentials {
  email: string;
  password: string;
}


export const AuthContext = React.createContext<{
  signInWithPassword: (credentials: Credentials) => { error?: string};
  signOut: () => void;
  token?: string | null;
  isLoading: boolean;
}>({
  signInWithPassword: () => ({ }),
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
