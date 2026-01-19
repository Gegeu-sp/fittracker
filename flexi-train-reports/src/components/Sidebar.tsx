import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  FileText, 
  Settings,
  Dumbbell,
  TrendingUp,
  Target
} from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    description: "Visão geral do sistema"
  },
  {
    title: "Alunos",
    url: "/students",
    icon: Users,
    description: "Gerenciar alunos"
  },
  {
    title: "Parser de Treinos",
    url: "/parser",
    icon: Brain,
    description: "Processar descrições"
  },
  {
    title: "Histórico",
    url: "/workouts",
    icon: FileText,
    description: "Treinos registrados"
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: TrendingUp,
    description: "Gerar relatórios"
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    description: "Configurações do sistema"
  }
];

const AppSidebar = () => {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { activeStudents, weeklyWorkouts, monthlyGrowth, loading } = useMetrics();

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent w-full";
    const activeClasses = isActive(path) 
      ? "bg-fitness-gradient text-black font-semibold shadow-fitness-glow" 
      : "text-sidebar-foreground hover:text-sidebar-accent-foreground";
    
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fitness-gradient rounded-lg">
            <Dumbbell className="h-6 w-6 text-black" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-sidebar-foreground truncate">FitTracker</h2>
            <p className="text-xs text-sidebar-foreground/60 truncate">Pro System</p>
          </div>
        </div>
      </div>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80 mb-4">
            Menu Principal
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      title={item.title}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-xs opacity-70 truncate">{item.description}</div>
                      </div>
                      {isActive(item.url) && (
                        <div className="w-2 h-2 bg-black rounded-full animate-pulse flex-shrink-0" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-sidebar-foreground/80 mb-4">
            Resumo Rápido
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              <div className="bg-sidebar-accent/20 p-3 rounded-lg border border-sidebar-border">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-sidebar-foreground min-w-0 truncate">Alunos Ativos</span>
                </div>
                <div className="text-xl font-bold text-primary">
                  {loading ? "..." : activeStudents}
                </div>
              </div>
              
              <div className="bg-sidebar-accent/20 p-3 rounded-lg border border-sidebar-border">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-sidebar-foreground min-w-0 truncate">Esta Semana</span>
                </div>
                <div className="text-xl font-bold text-primary">
                  {loading ? "..." : weeklyWorkouts}
                </div>
                <div className="text-xs text-sidebar-foreground/60">treinos</div>
              </div>
              
              <div className="bg-sidebar-accent/20 p-3 rounded-lg border border-sidebar-border">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm font-medium text-sidebar-foreground min-w-0 truncate">Progresso</span>
                </div>
                <div className="text-xl font-bold text-success">
                  {loading ? "..." : (monthlyGrowth > 0 ? `+${monthlyGrowth}%` : `${monthlyGrowth}%`)}
                </div>
                <div className="text-xs text-sidebar-foreground/60">vs semana ant.</div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 mt-auto">
        <div className="text-center mb-4">
          <p className="text-xs text-sidebar-foreground/60">
            FitTracker Pro v1.0
          </p>
          <p className="text-xs text-sidebar-foreground/40 mt-1">
            Sistema Personal Trainer
          </p>
        </div>
        
        {/* Sidebar Toggle */}
        <SidebarTrigger className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border-sidebar-border" />
      </div>
    </Sidebar>
  );
};

export default AppSidebar;