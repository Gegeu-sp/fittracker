import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('alunos').select('id').limit(1);
      
      if (error) {
        setStatus('error');
        setErrorMessage(error.message || 'Erro ao conectar com o Supabase');
        try { localStorage.setItem('supabase_connection_status', 'error'); localStorage.setItem('supabase_offline', 'true'); } catch { void 0; }
      } else {
        setStatus('connected');
        setErrorMessage(null);
        try { localStorage.setItem('supabase_connection_status', 'connected'); localStorage.setItem('supabase_offline', 'false'); } catch { void 0; }
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Falha na conexão de rede');
      try { localStorage.setItem('supabase_connection_status', 'error'); localStorage.setItem('supabase_offline', 'true'); } catch { void 0; }
    }
  };

  if (status === 'connected') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert variant={status === 'error' ? "destructive" : "default"} className="shadow-lg">
        {status === 'error' ? (
          <WifiOff className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        <AlertTitle>{status === 'error' ? 'Erro de Conexão' : 'Verificando Conexão...'}</AlertTitle>
        <AlertDescription>
          {errorMessage || 'Tentando reconectar ao servidor...'}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionStatus;
