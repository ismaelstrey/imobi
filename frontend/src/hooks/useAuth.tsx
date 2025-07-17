import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, apiService } from "../services/api";

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe token salvo no localStorage
    const token = localStorage.getItem("@imobi:token");
    const userData = localStorage.getItem("@imobi:user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao recuperar dados do usuário:", error);
        localStorage.removeItem("@imobi:token");
        localStorage.removeItem("@imobi:user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, senha });

      const { token, user: userData } = response.data;

      console.log(response);

      // Salvar token e dados do usuário no localStorage
      localStorage.setItem("@imobi:token", token);
      localStorage.setItem("@imobi:user", JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("@imobi:token");
    localStorage.removeItem("@imobi:user");
    setUser(null);
  };

  const value: AuthContextData = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
