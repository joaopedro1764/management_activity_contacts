// src/contexts/AuthContext.tsx
import { useLogin } from "@/api/api";
import type { LoginProps } from "@/types/client";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (credentials: LoginProps) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // <- estado para evitar flicker
  const { mutateAsync: mutateLogin } = useLogin();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // Verifica se o token está expirado
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          throw new Error("Token expirado");
        }

        setUser(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        toast.error("Erro ao decodificar token:");
        logout();
      }
    }

    setLoading(false); // <- fim do carregamento
  }, []);

  async function login({ email, senha }: LoginProps) {
    try {
      const response = await mutateLogin({ email, senha });

      if (response.success && response.token) {
        localStorage.setItem("token", response.token);

        const decoded = jwtDecode(response.token);
        setUser(decoded);
        setIsAuthenticated(true);
        navigate("/listaClientes");
      } else {
        toast.error("Email ou senha inválidos");
      }
    } catch (error: any) {
      toast.error("Erro no login: " + error?.message || error);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  }

  // Enquanto estiver carregando, retorna null ou um splash
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
