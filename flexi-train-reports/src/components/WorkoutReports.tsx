import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Users
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getWorkouts, type WorkoutWithDetails } from "@/services/apiWorkouts";
import { getAlunos } from "@/services/apiAlunos";
import type { Database } from "@/integrations/supabase/types";

type AlunoRow = Database['public']['Tables']['alunos']['Row'];

const WorkoutReports = () => {
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [alunos, setAlunos] = useState<AlunoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [workoutsData, alunosData] = await Promise.all([
          getWorkouts(),
          getAlunos()
        ]);
        setWorkouts(workoutsData);
        setAlunos(alunosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados dos relatórios.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter workouts by selected period
  const filteredWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.data_treino);
    const today = new Date();
    const daysAgo = new Date(today.getTime() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000);
    return workoutDate >= daysAgo;
  });

  // Calculate metrics
  const totalWorkouts = filteredWorkouts.length;
  const totalVolume = filteredWorkouts.reduce((sum, w) => sum + Number(w.volume_total), 0);
  const totalExercises = filteredWorkouts.reduce((sum, w) => sum + w.total_exercicios, 0);
  const totalSets = filteredWorkouts.reduce((sum, w) => sum + w.total_series, 0);
  const avgVolumePerWorkout = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0;

  // Most active students
  const studentStats = alunos.map(aluno => {
    const studentWorkouts = filteredWorkouts.filter(w => w.aluno_id === aluno.id);
    const studentVolume = studentWorkouts.reduce((sum, w) => sum + Number(w.volume_total), 0);
    return {
      ...aluno,
      workoutCount: studentWorkouts.length,
      totalVolume: studentVolume
    };
  }).sort((a, b) => b.workoutCount - a.workoutCount);

  // Most popular exercises
  const exerciseStats = filteredWorkouts.reduce((acc, workout) => {
    workout.exercises.forEach(exercise => {
      if (!acc[exercise.nome]) {
        acc[exercise.nome] = 0;
      }
      acc[exercise.nome]++;
    });
    return acc;
  }, {} as Record<string, number>);

  const topExercises = Object.entries(exerciseStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-subtle-gradient p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto animate-spin mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Relatórios de Performance
          </h1>
          <p className="text-lg text-muted-foreground">
            Análise detalhada do desempenho dos treinos e alunos
          </p>
        </div>

        {/* Period Filter */}
        <Card className="card-fitness">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-primary" />
              <label className="text-sm font-medium">Período de análise:</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-fitness">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total de Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                nos últimos {selectedPeriod} dias
              </p>
            </CardContent>
          </Card>

          <Card className="card-fitness">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Volume Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalVolume.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                Média: {avgVolumePerWorkout.toFixed(1)} kg/treino
              </p>
            </CardContent>
          </Card>

          <Card className="card-fitness">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Exercícios Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalExercises}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalSets} séries totais
              </p>
            </CardContent>
          </Card>

          <Card className="card-fitness">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Alunos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {studentStats.filter(s => s.workoutCount > 0).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {alunos.length} cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-fitness">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Alunos Mais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentStats.slice(0, 5).map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student.nome}</p>
                      <p className="text-sm text-muted-foreground">{student.workoutCount} treinos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{student.totalVolume.toFixed(1)} kg</p>
                    <p className="text-xs text-muted-foreground">volume total</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Exercises */}
          <Card className="card-fitness">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Exercícios Mais Populares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topExercises.map(([exercise, count], index) => (
                <div key={exercise} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="font-medium text-foreground">{exercise}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {count}x
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trend (placeholder for future chart implementation) */}
        <Card className="card-fitness">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendência de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Gráficos detalhados em desenvolvimento
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Em breve: gráficos de evolução, comparativos e análises avançadas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutReports;