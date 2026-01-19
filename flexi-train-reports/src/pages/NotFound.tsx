import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-subtle-gradient flex items-center justify-center p-6">
      <Card className="card-fitness max-w-md w-full text-center animate-fade-in">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">404</h1>
              <h2 className="text-xl font-semibold text-foreground mb-2">Página não encontrada</h2>
              <p className="text-muted-foreground">
                A página que você está procurando não existe ou foi movida.
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg border border-secondary/20">
              <strong>Rota acessada:</strong> <code className="text-primary">{location.pathname}</code>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="btn-fitness w-full"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-primary/30 hover:bg-primary/10"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Página Anterior
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
