import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Login from "./components/Login";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppSidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import StudentList from "./components/StudentList";
import StudentDetails from "./components/StudentDetails";
import WorkoutParser from "./components/WorkoutParser";
import WorkoutHistory from "./components/WorkoutHistory";
import WorkoutReports from "./components/WorkoutReports";
import Settings from "./components/Settings";
import ParserEquivalenceTester from "./components/dev/ParserEquivalenceTester";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import ConnectionStatus from "./components/ConnectionStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Verificar sessão inicial
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // 2. Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 3. Renderização Condicional - GATEKEEPER

  // Estado 1: Carregando (Bloqueio Total)
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#ff8c00] border-t-transparent animate-spin"></div>
          <p className="text-sm text-gray-400 font-montserrat">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Estado 2: Não Autenticado (Login)
  if (!session) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Estado 3: Autenticado (App Protegido)
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConnectionStatus />
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen flex w-full bg-background relative">
              <AppSidebar />
              
              {/* Botão Temporário de Logout */}
              <div className="absolute top-4 right-4 z-50">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload(); // Forçar recarregamento limpo
                  }}
                  className="flex items-center gap-2 shadow-lg hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sair (Teste)
                </Button>
              </div>

              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/students" element={<StudentList />} />
                  <Route path="/students/:id" element={<StudentDetails />} />
                  <Route path="/parser" element={<WorkoutParser />} />
                  <Route path="/dev/parser-tester" element={<ParserEquivalenceTester />} />
                  <Route path="/workouts" element={<WorkoutHistory />} />
                  <Route path="/reports" element={<WorkoutReports />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
