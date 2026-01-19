import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Dumbbell,
  Target,
  TrendingUp,
  Edit,
  Activity,
  Filter,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getWorkouts, deleteWorkout, type WorkoutWithDetails } from "@/services/apiWorkouts";
import { getAlunos } from "@/services/apiAlunos";
import ConfirmDialog from "./ConfirmDialog";
import type { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { formatDateDisplay } from "@/lib/utils";

type AlunoRow = Database['public']['Tables']['alunos']['Row'];

const WorkoutHistory = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [alunos, setAlunos] = useState<AlunoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAluno, setSelectedAluno] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar dados
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
          description: "Não foi possível carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredWorkouts = selectedAluno && selectedAluno !== "all"
    ? workouts.filter(workout => workout.aluno_id === selectedAluno)
    : workouts;

  const handleEditClick = (workout: WorkoutWithDetails) => {
    navigate('/parser', { state: { editWorkout: workout } });
  };

  const handleDeleteClick = (workout: WorkoutWithDetails) => {
    setWorkoutToDelete(workout);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workoutToDelete) return;

    setIsDeleting(true);
    try {
      await deleteWorkout(workoutToDelete.id);
      setWorkouts(prev => prev.filter(w => w.id !== workoutToDelete.id));
      toast({
        title: "Treino excluído",
        description: "O treino foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar treino:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o treino.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setWorkoutToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateDisplay(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-success text-success-foreground';
      case 'pausado': return 'bg-warning text-warning-foreground';
      case 'inativo': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-subtle-gradient p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto animate-spin mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando histórico de treinos...</p>
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
            <Calendar className="h-8 w-8 text-primary" />
            Histórico de Treinos
          </h1>
          <p className="text-lg text-muted-foreground">
            Visualize e gerencie todos os treinos registrados no sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-fitness">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{workouts.length}</div>
            </CardContent>
          </Card>

          <Card className="card-fitness">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Volume Total (kg)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {workouts.reduce((sum, w) => sum + Number(w.volume_total), 0).toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-fitness">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Exercícios Únicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {workouts.reduce((sum, w) => sum + w.total_exercicios, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-fitness">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <Select value={selectedAluno} onValueChange={setSelectedAluno}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Filtrar por aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os alunos</SelectItem>
                    {alunos.map((aluno) => (
                      <SelectItem key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedAluno("all")}
                className="border-primary/30 hover:bg-primary/10"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workouts List */}
        <div className="space-y-4">
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="card-fitness hover-glow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Workout Info */}
                    <div className="lg:col-span-2 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground">
                            {workout.aluno?.nome || "Aluno não encontrado"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {workout.tipo_treino || "Treino sem categoria"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {formatDate(workout.data_treino)}
                          </p>
                        </div>
                      </div>

                      {workout.observacoes && (
                        <p className="text-sm text-muted-foreground italic">
                          "{workout.observacoes}"
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {workout.total_exercicios}
                        </div>
                        <div className="text-xs text-muted-foreground">Exercícios</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {workout.total_series}
                        </div>
                        <div className="text-xs text-muted-foreground">Séries</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {Number(workout.volume_total).toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Volume (kg)</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(workout)}
                        className="text-primary border-primary/30 hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(workout)}
                        className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Exercises Preview */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.slice(0, 3).map((exercise) => (
                          <Badge key={exercise.id} variant="outline" className="text-xs">
                            {exercise.nome}
                          </Badge>
                        ))}
                        {workout.exercises.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{workout.exercises.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-fitness">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum treino encontrado
                </h3>
                <p className="text-muted-foreground">
                  {selectedAluno && selectedAluno !== "all"
                    ? "Este aluno ainda não possui treinos registrados."
                    : "Ainda não há treinos registrados no sistema."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Excluir Treino"
          description={`Tem certeza que deseja excluir o treino de ${workoutToDelete?.aluno?.nome} do dia ${workoutToDelete ? formatDate(workoutToDelete.data_treino) : ''}?`}
          confirmText="Excluir"
          cancelText="Cancelar"
          isLoading={isDeleting}
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default WorkoutHistory;