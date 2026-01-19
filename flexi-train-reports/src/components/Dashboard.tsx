import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from "recharts";
import { 
  Users, 
  Dumbbell, 
  TrendingUp, 
  Calendar,
  Plus,
  Activity,
  Target,
  Award,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getWorkouts } from "@/services/apiWorkouts";
import { useNavigate } from "react-router-dom";
import { formatDateDisplay, safeAvatarSrc } from "@/lib/utils";
import { useMetrics } from "@/hooks/useMetrics";
import type { WorkoutWithDetails } from "@/services/apiWorkouts";

interface RecentActivity {
  id: string;
  studentName: string;
  studentPhoto?: string | null;
  workoutType: string;
  date: string;
  volume: number;
  exercises: number;
}

interface WeeklyVolumePoint {
  name: string;
  volume: number;
  fullDate: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [weeklyVolumeData, setWeeklyVolumeData] = useState<WeeklyVolumePoint[]>([]);
  
  // Use unified metrics hook
  const { 
    totalStudents, 
    activeStudents, 
    weeklyWorkouts, 
    monthlyGrowth, 
    totalVolume,
    totalVolumeThisWeek,
    totalExercises,
    avgWorkoutDuration,
    loading 
  } = useMetrics();

  // Fetch workouts separately just for the list and chart (could be optimized further)
  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
  });

  // Prepare Chart Data
  if (!loading && weeklyVolumeData.length === 0 && workouts.length > 0) {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });

    const volumeData = last7Days.map(date => {
      const [yy, mm, dd] = date.split('-');
      const localDate = new Date(Number(yy), Number(mm) - 1, Number(dd));
      const dayWorkouts = workouts.filter(w => w.data_treino === date);
      const volume = dayWorkouts.reduce((sum, w) => sum + (w.volume_total || 0), 0);
      return {
        name: localDate.toLocaleDateString('pt-BR', { weekday: 'short' }),
        volume: Math.round(volume),
        fullDate: date
      };
    });
    setWeeklyVolumeData(volumeData);
  }

  const recentActivities: RecentActivity[] = workouts
    .slice(0, 5)
    .map(workout => ({
      id: workout.id,
      studentName: workout.aluno?.nome || 'Aluno desconhecido',
      studentPhoto: workout.aluno?.foto_url,
      workoutType: workout.tipo_treino || 'Treino personalizado',
      date: formatDateDisplay(workout.data_treino),
      volume: Math.round(workout.volume_total || 0),
      exercises: workout.total_exercicios || 0
    }));

  const motivationalQuotes = [
    "A disciplina é a ponte entre objetivos e conquistas!",
    "Cada repetição é um passo mais próximo do seu melhor!",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia!",
    "Transforme seus limites em conquistas!",
    "A única pessoa que você deve tentar ser melhor é quem você era ontem!"
  ];

  const [dailyQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleQuickAction = (action: string, route: string) => {
    toast({
      title: "Redirecionando",
      description: `Abrindo ${action}...`,
    });
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-subtle-gradient p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            FitTracker Pro
          </h1>
          <p className="text-lg text-muted-foreground">
            Sistema de Relatórios para Personal Trainers
          </p>
          <div className="bg-card-gradient p-4 rounded-lg border border-primary/20">
            <p className="text-primary font-medium italic">"{dailyQuote}"</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-fitness hover-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alunos Ativos
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : activeStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de {totalStudents} cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="card-fitness hover-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Volume Esta Semana (kg)
              </CardTitle>
              <Target className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : totalVolumeThisWeek.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {weeklyWorkouts} treinos realizados
              </p>
            </CardContent>
          </Card>

          <Card className="card-fitness hover-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progresso Mensal
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : (monthlyGrowth > 0 ? `+${monthlyGrowth}%` : `${monthlyGrowth}%`)}
              </div>
              <p className="text-xs text-muted-foreground">
                Em relação à semana anterior
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card-fitness lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume']}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Alunos</div>
                </div>
                <div className="text-center p-4 bg-secondary/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{workouts.length}</div>
                  <div className="text-sm text-muted-foreground">Treinos</div>
                </div>
                <div className="text-center p-4 bg-secondary/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalExercises}</div>
                  <div className="text-sm text-muted-foreground">Exercícios</div>
                </div>
                <div className="text-center p-4 bg-secondary/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(totalVolume / 1000)}k
                  </div>
                  <div className="text-sm text-muted-foreground">Total (kg)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-fitness">
            <CardHeader>
              <CardTitle className="text-center">Status dos Alunos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ativos</span>
                  <span className="font-bold text-success">{activeStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Inativos</span>
                  <span className="font-bold text-muted-foreground">
                    {totalStudents - activeStudents}
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: `${totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {totalStudents > 0 
                    ? Math.round((activeStudents / totalStudents) * 100)
                    : 0}% de taxa de atividade
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="card-fitness">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="btn-fitness h-16 flex-col gap-2"
                onClick={() => handleQuickAction('cadastro de aluno', '/students')}
              >
                <Plus className="h-5 w-5" />
                Novo Aluno
              </Button>
              <Button 
                className="btn-fitness h-16 flex-col gap-2"
                onClick={() => handleQuickAction('parser de treino', '/parser')}
              >
                <Dumbbell className="h-5 w-5" />
                Parser Treino
              </Button>
              <Button 
                className="btn-fitness h-16 flex-col gap-2"
                onClick={() => handleQuickAction('histórico de treinos', '/workouts')}
              >
                <Award className="h-5 w-5" />
                Ver Histórico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="card-fitness">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando atividades...
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarImage src={safeAvatarSrc(activity.studentPhoto)} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(activity.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="font-medium text-foreground truncate w-[140px] md:w-auto" title={activity.studentName}>
                          {activity.studentName}
                        </h4>
                        <p className="text-sm text-muted-foreground">{activity.workoutType}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{activity.date}</p>
                        <p className="text-xs text-primary md:hidden">{activity.exercises} exercícios</p>
                      </div>
                    </div>
                    
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-muted-foreground mb-1">{activity.date}</p>
                      <p className="font-bold text-primary">{activity.volume} kg</p>
                      <p className="text-xs text-muted-foreground">{activity.exercises} exercícios</p>
                    </div>

                    <div className="text-right md:hidden">
                       <p className="font-bold text-primary">{activity.volume} kg</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum treino registrado ainda</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/parser')}
                  >
                    Adicionar primeiro treino
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
