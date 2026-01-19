import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Award, 
  Activity,
  Copy,
  Clock,
  Mail,
  Phone,
  MessageCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from "@/hooks/use-toast";
import { getAlunoById } from "@/services/apiAlunos";
import { getWorkoutsByAluno, type WorkoutWithDetails } from "@/services/apiWorkouts";
import { getStudentTotalLifetimeVolume } from "@/hooks/useMetrics";
import StudentMonthlyReport from "@/components/StudentMonthlyReport";
import type { Aluno } from "@/types/aluno";
import { safeAvatarSrc } from "@/lib/utils";
import { formatDateDisplay } from "@/lib/utils";

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  interface ChartPoint {
    date: string;
    fullDate: string;
    volume: number;
    type: string | null;
  }
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  // Fetch student details
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ['student', id],
    queryFn: () => id ? getAlunoById(id) : null,
    enabled: !!id
  });

  // Fetch workout history
  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ['student-workouts', id],
    queryFn: () => id ? getWorkoutsByAluno(id) : [],
    enabled: !!id
  });

  // Process data for chart and stats when workouts are loaded
  useEffect(() => {
    if (workouts && workouts.length > 0) {
      // Sort by date ascending for chart
      const sortedWorkouts = [...workouts].sort((a, b) => 
        new Date(a.data_treino).getTime() - new Date(b.data_treino).getTime()
      );

      const data = sortedWorkouts.map(workout => ({
        date: new Date(workout.data_treino).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: formatDateDisplay(workout.data_treino),
        volume: workout.volume_total,
        type: workout.tipo_treino
      }));

      setChartData(data);
    }
  }, [workouts]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleReuseWorkout = (workout: WorkoutWithDetails) => {
    navigate('/parser', { 
      state: { 
        editWorkout: {
          ...workout,
          id: null, // Clear ID to create new instead of update
          data_treino: new Date().toISOString().split('T')[0] // Set to today
        } 
      } 
    });
    toast({
      title: "Cópia de Treino Iniciada",
      description: "Os dados foram carregados no parser para um novo treino.",
    });
  };

  if (isLoadingStudent || isLoadingWorkouts) {
    return (
      <div className="min-h-screen bg-subtle-gradient p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button variant="ghost" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-subtle-gradient p-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Aluno não encontrado</h2>
        <Button onClick={() => navigate('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Button>
      </div>
    );
  }

  // Calculate Stats
  const totalWorkouts = workouts?.length || 0;
  const totalLifetimeVolume = workouts ? getStudentTotalLifetimeVolume(workouts) : 0;
  const lastActivity = workouts && workouts.length > 0 
    ? formatDateDisplay(workouts[0].data_treino)
    : 'Sem registros';

  return (
    <div className="min-h-screen bg-subtle-gradient p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/students')}
            className="hover:bg-background/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-card-gradient p-6 rounded-2xl border border-primary/10 shadow-lg">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarImage src={safeAvatarSrc(student.foto_url)} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {getInitials(student.nome)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gradient">{student.nome}</h1>
                <Badge variant={student.status === 'ativo' ? 'default' : 'secondary'} className="capitalize">
                  {student.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Desde {formatDateDisplay(student.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </div>
                {student.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {student.telefone}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {student.whatsapp || 'Não informado'}
                </div>
                {student.objetivo && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {student.objetivo}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
            <StudentMonthlyReport student={student as Aluno} workouts={workouts || []} />
            <Button onClick={() => navigate('/parser')} className="btn-fitness">
              <Dumbbell className="mr-2 h-4 w-4" />
              Novo Treino
            </Button>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-fitness hover-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Treinos</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">Sessões realizadas</p>
            </CardContent>
          </Card>

          <Card className="card-fitness hover-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volume Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLifetimeVolume.toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground">Acumulado em todas as sessões</p>
            </CardContent>
          </Card>

          <Card className="card-fitness hover-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Última Atividade</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lastActivity}</div>
              <p className="text-xs text-muted-foreground">Data do último treino</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card-fitness lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Evolução de Volume de Carga
              </CardTitle>
              <CardDescription>
                Acompanhamento do volume total (séries x repetições x carga) ao longo do tempo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <RechartsTooltip
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume Total']}
                        labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorVolume)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Dados insuficientes para gerar gráfico
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout History */}
        <Card className="card-fitness">
          <CardHeader>
            <CardTitle>Histórico de Treinos</CardTitle>
            <CardDescription>
              Lista completa de sessões registradas para este aluno.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workouts && workouts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo/Foco</TableHead>
                    <TableHead>Exercícios</TableHead>
                    <TableHead>Volume Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workouts.map((workout) => (
                    <TableRow key={workout.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        {formatDateDisplay(workout.data_treino)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {workout.tipo_treino || 'Geral'}
                        </Badge>
                      </TableCell>
                      <TableCell>{workout.total_exercicios} mov.</TableCell>
                      <TableCell className="font-bold text-primary">
                        {workout.volume_total?.toLocaleString()} kg
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleReuseWorkout(workout)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Repetir
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copiar este treino para hoje</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum treino registrado para este aluno.</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/parser')}
                  className="mt-2 text-primary"
                >
                  Registrar primeiro treino
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper component for icon missing in lucide import
const Target = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export default StudentDetails;
