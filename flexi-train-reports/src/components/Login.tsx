import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Erro ao fazer login: " + error.message);
      } else {
        toast.success("Login realizado com sucesso!");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Elementos de fundo decorativos */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fitness-orange/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-fitness-orange/20 shadow-fitness-glow bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-fitness-orange/20 flex items-center justify-center mb-4 ring-2 ring-fitness-orange/50">
            <Dumbbell className="w-8 h-8 text-fitness-orange" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            FitTracker Pro
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Entre com suas credenciais de administrador
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@fittracker.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-input bg-background/50 focus:border-fitness-orange focus:ring-fitness-orange/20"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-input bg-background/50 focus:border-fitness-orange focus:ring-fitness-orange/20"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-fitness-orange hover:bg-fitness-orange-light text-black font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,140,0,0.3)] hover:shadow-[0_0_30px_rgba(255,140,0,0.5)]"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Acessar Sistema"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="absolute bottom-4 text-center w-full text-xs text-muted-foreground opacity-50">
        &copy; {new Date().getFullYear()} FitTracker System. Acesso restrito.
      </div>
    </div>
  );
};

export default Login;
