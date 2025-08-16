import { useState } from "react";
import { useForm } from "react-hook-form";
import type { LoginProps } from "@/types/client";
import { useAuth } from "@/context/AuthContext";
import fundoLogin from "../../assets/fundo-login.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
export function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit } = useForm<LoginProps>();

  const { login } = useAuth();

  async function handleLogin({ email, senha }: LoginProps) {
    await login({ email, senha });
  }
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/5" />

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero Image and Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-background/10" />
          <img
            src={fundoLogin}
            alt="Sistema de Recuperação"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

          {/* Company Branding */}
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                N-Multifibra
              </h1>
              <h2 className="text-xl text-primary font-semibold">
                Sistema N-Recupera +
              </h2>
              <p className="text-lg text-foreground/70 max-w-md leading-relaxed">
                Potencialize a recuperação de clientes com tecnologia avançada e
                conectividade de fibra óptica.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                N-Multifibra
              </h1>
              <h2 className="text-lg text-primary font-semibold">
                Sistema N-Recupera +
              </h2>
            </div>

            <Card className="w-full max-w-md bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border-border/20 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-elegant">
                    <ArrowRight className="w-8 h-8 text-primary-foreground rotate-[-45deg]" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-gray-100">
                      N-Recupera +
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Sistema N-Multifibra
                    </p>
                  </div>
                </div>
                <CardDescription className="text-center text-foreground/70">
                  Entre na sua conta para acessar o sistema de recuperação
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={handleSubmit(handleLogin)}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        E-mail
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          {...register("email")}
                          className="pl-10 h-12 bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground"
                      >
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...register("senha")}
                          className="pl-10 pr-10 h-12 bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <button className="text-sm text-primary hover:text-primary-glow transition-colors underline-offset-4 hover:underline">
                      Esqueceu a senha?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-base font-semibold"
                  >
                    Entrar no Sistema
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Não tem uma conta?{" "}
                      <button className="text-primary hover:text-primary-glow transition-colors underline-offset-4 hover:underline">
                        Fale com seu gestor
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
