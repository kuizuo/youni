import { createContext, useContext } from 'react';

export interface Credentials {
  username: string;
  password: string;
}

interface AuthContextProps {
  signInWithPassword: (credentials: Credentials) => Promise<{ error?: { message: string } }>;
  signOut: () => void;
  token?: string | null;
}

export const AuthContext = createContext({} as AuthContextProps)

export const useAuth = () => useContext(AuthContext)