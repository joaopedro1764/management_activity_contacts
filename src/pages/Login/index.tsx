import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useForm } from "react-hook-form"
import type { LoginProps } from "@/types/client";
import { useAuth } from "@/context/AuthContext";
export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm<LoginProps>()
  const { login } = useAuth()

  async function handleLogin({ email, senha }: LoginProps) {
    await login({ email, senha })
  }

  return (
    <div className="min-h-screen bg-gradient-background relative overflow-hidden">

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-elegant mb-6 relative">
              <div className="absolute inset-0 bg-white rounded-3xl opacity-20"></div>
              <Shield className="w-10 h-10 text-primary-foreground relative z-10" />
            </div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2 tracking-tight">
              N-Recupera +
            </h1>
            <p className="font-medium text-lg">
              Sistema de recuperação de cliente
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-elegant border-0 animate-slide-in backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl text-center">Entrar na sua conta</CardTitle>
              <CardDescription className="text-center">
                Digite suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      {...register("email")}
                      className="pl-10 h-12 focus:ring-primary border-border"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...register("senha")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-12 h-12 focus:ring-primary border-border"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full h-12"
                >
                  Entrar no Sistema
                </Button>
              </form>

            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <p
              className="text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Fale com seu gestor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};