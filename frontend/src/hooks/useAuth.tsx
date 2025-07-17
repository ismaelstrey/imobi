import { createContext } from "react";
import { User } from "../services/api";

export interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Re-exportando os componentes e hooks
export { AuthProvider } from './AuthContextProvider';
export { useAuth } from './useAuthHook';
