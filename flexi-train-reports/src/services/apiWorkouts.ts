import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WorkoutRow = Database['public']['Tables']['workouts']['Row'];
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
type ExerciseSetRow = Database['public']['Tables']['exercise_sets']['Row'];
type ExerciseSetInsert = Database['public']['Tables']['exercise_sets']['Insert'];

export interface WorkoutWithDetails extends WorkoutRow {
  exercises: (ExerciseRow & {
    exercise_sets: ExerciseSetRow[];
  })[];
  aluno?: {
    id: string;
    nome: string;
    email: string;
    foto_url?: string | null;
  };
}

export interface CreateWorkoutData {
  alunoId: string;
  dataTreino?: string;
  tipoTreino?: string;
  observacoes?: string;
  exercises: {
    nome: string;
    ordem: number;
    sets: {
      series: number;
      repeticoes: string;
      peso: number;
      volume: number;
      ordem: number;
    }[];
  }[];
}

export async function getWorkouts(): Promise<WorkoutWithDetails[]> {
  try {
    if (isSupabaseOffline()) {
      return [];
    }
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        alunos!workouts_aluno_id_fkey(id, nome, email, foto_url),
        exercises(
          *,
          exercise_sets(*)
        )
      `)
      .order('data_treino', { ascending: false });

    if (error) {
      console.error('Erro ao buscar treinos:', error);
      throw error;
    }

    return (data || []).map(workout => ({
      ...workout,
      exercises: (workout.exercises || []).sort((a, b) => a.ordem - b.ordem).map(exercise => ({
        ...exercise,
        exercise_sets: (exercise.exercise_sets || []).sort((a, b) => a.ordem - b.ordem)
      })),
      aluno: workout.alunos ? {
        id: workout.alunos.id,
        nome: workout.alunos.nome,
        email: workout.alunos.email,
        foto_url: workout.alunos.foto_url,
      } : undefined
    }));
  } catch (error) {
    console.error('Erro na função getWorkouts:', error);
    // Retorna array vazio em caso de erro de rede para não quebrar a UI
    // O usuário verá o ConnectionStatus avisando do erro
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Erro de rede detectado ao buscar treinos. Retornando lista vazia.');
      return [];
    }
    throw error;
  }
}

export async function getWorkoutsByAluno(alunoId: string): Promise<WorkoutWithDetails[]> {
  try {
    if (isSupabaseOffline()) {
      return [];
    }
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        alunos!workouts_aluno_id_fkey(id, nome, email, foto_url),
        exercises(
          *,
          exercise_sets(*)
        )
      `)
      .eq('aluno_id', alunoId)
      .order('data_treino', { ascending: false });

    if (error) {
      console.error('Erro ao buscar treinos do aluno:', error);
      throw error;
    }

    return (data || []).map(workout => ({
      ...workout,
      exercises: (workout.exercises || []).sort((a, b) => a.ordem - b.ordem).map(exercise => ({
        ...exercise,
        exercise_sets: (exercise.exercise_sets || []).sort((a, b) => a.ordem - b.ordem)
      })),
      aluno: workout.alunos ? {
        id: workout.alunos.id,
        nome: workout.alunos.nome,
        email: workout.alunos.email,
        foto_url: workout.alunos.foto_url,
      } : undefined
    }));
  } catch (error) {
    console.error('Erro na função getWorkoutsByAluno:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Erro de rede detectado ao buscar treinos do aluno. Retornando lista vazia.');
      return [];
    }
    throw error;
  }
}

function isSupabaseOffline(): boolean {
  try {
    return localStorage.getItem('supabase_offline') === 'true';
  } catch {
    return false;
  }
}

export async function createWorkout(workoutData: CreateWorkoutData): Promise<WorkoutWithDetails> {
  try {
    if (isSupabaseOffline()) {
      throw new Error('Supabase offline: operação indisponível');
    }
    // Calcular totais do treino
    const totalExercicios = workoutData.exercises.length;
    let totalSeries = 0;
    let totalRepeticoes = 0;
    let volumeTotal = 0;

    workoutData.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalSeries += set.series;
        
        // Calcular repetições (considerando unilaterais como "10/10")
        if (set.repeticoes.includes('/')) {
          const reps = set.repeticoes.split('/').map(r => parseInt(r));
          totalRepeticoes += set.series * reps.reduce((sum, r) => sum + r, 0);
        } else {
          totalRepeticoes += set.series * parseInt(set.repeticoes);
        }
        
        volumeTotal += set.volume;
      });
    });

    // Criar o treino
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        aluno_id: workoutData.alunoId,
        data_treino: workoutData.dataTreino || new Date().toISOString().split('T')[0],
        tipo_treino: workoutData.tipoTreino,
        observacoes: workoutData.observacoes,
        total_exercicios: totalExercicios,
        total_series: totalSeries,
        total_repeticoes: totalRepeticoes,
        volume_total: volumeTotal,
      })
      .select()
      .single();

    if (workoutError) {
      console.error('Erro ao criar treino:', workoutError);
      throw workoutError;
    }

    // Criar exercícios
    for (const exerciseData of workoutData.exercises) {
      const exerciseTotalSeries = exerciseData.sets.reduce((sum, set) => sum + set.series, 0);
      const exerciseVolumeTotal = exerciseData.sets.reduce((sum, set) => sum + set.volume, 0);

      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workout.id,
          nome: exerciseData.nome,
          ordem: exerciseData.ordem,
          total_series: exerciseTotalSeries,
          volume_total: exerciseVolumeTotal,
        })
        .select()
        .single();

      if (exerciseError) {
        console.error('Erro ao criar exercício:', exerciseError);
        throw exerciseError;
      }

      // Criar sets do exercício
      const setsToInsert: ExerciseSetInsert[] = exerciseData.sets.map(set => ({
        exercise_id: exercise.id,
        series: set.series,
        repeticoes: set.repeticoes,
        peso: set.peso,
        volume: set.volume,
        ordem: set.ordem,
      }));

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(setsToInsert);

      if (setsError) {
        console.error('Erro ao criar sets:', setsError);
        throw setsError;
      }
    }

    // Buscar o treino completo criado
    const { data: fullWorkout, error: fullWorkoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        alunos!workouts_aluno_id_fkey(id, nome, email),
        exercises(
          *,
          exercise_sets(*)
        )
      `)
      .eq('id', workout.id)
      .single();

    if (fullWorkoutError) {
      console.error('Erro ao buscar treino completo:', fullWorkoutError);
      throw fullWorkoutError;
    }

    return {
      ...fullWorkout,
      aluno: fullWorkout.alunos ? {
        id: fullWorkout.alunos.id,
        nome: fullWorkout.alunos.nome,
        email: fullWorkout.alunos.email,
      } : undefined
    };
  } catch (error) {
    console.error('Erro na função createWorkout:', error);
    throw error;
  }
}

export async function updateWorkout(id: string, workoutData: CreateWorkoutData): Promise<WorkoutWithDetails> {
  try {
    if (isSupabaseOffline()) {
      throw new Error('Supabase offline: operação indisponível');
    }
    // 1. Calcular totais do treino (Mesma lógica do create)
    const totalExercicios = workoutData.exercises.length;
    let totalSeries = 0;
    let totalRepeticoes = 0;
    let volumeTotal = 0;

    workoutData.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalSeries += set.series;
        
        // Calcular repetições
        if (set.repeticoes.includes('/')) {
          const reps = set.repeticoes.split('/').map(r => parseInt(r));
          totalRepeticoes += set.series * reps.reduce((sum, r) => sum + r, 0);
        } else {
          totalRepeticoes += set.series * parseInt(set.repeticoes);
        }
        
        volumeTotal += set.volume;
      });
    });

    // 2. Atualizar dados do treino
    const { error: workoutError } = await supabase
      .from('workouts')
      .update({
        aluno_id: workoutData.alunoId,
        data_treino: workoutData.dataTreino,
        tipo_treino: workoutData.tipoTreino,
        observacoes: workoutData.observacoes,
        total_exercicios: totalExercicios,
        total_series: totalSeries,
        total_repeticoes: totalRepeticoes,
        volume_total: volumeTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (workoutError) {
      console.error('Erro ao atualizar treino:', workoutError);
      throw workoutError;
    }

    // 3. Deletar exercícios antigos (Cascade deve deletar sets)
    // Para segurança, vamos buscar os exercícios antigos primeiro
    const { data: oldExercises, error: fetchError } = await supabase
      .from('exercises')
      .select('id')
      .eq('workout_id', id);
      
    if (fetchError) {
      console.error('Erro ao buscar exercícios antigos:', fetchError);
      throw fetchError;
    }

    // Se houver exercícios, deletamos. O Cascade do banco deve limpar os sets.
    // Se não tiver cascade configurado no banco, precisariamos deletar os sets antes.
    // Vamos assumir que sim, mas por segurança deletamos explicitamente se falhar
    if (oldExercises && oldExercises.length > 0) {
       const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', id);

      if (deleteError) {
         console.error('Erro ao deletar exercícios antigos:', deleteError);
         throw deleteError;
      }
    }

    // 4. Inserir novos exercícios (Cópia da lógica do create)
    for (const exerciseData of workoutData.exercises) {
      const exerciseTotalSeries = exerciseData.sets.reduce((sum, set) => sum + set.series, 0);
      const exerciseVolumeTotal = exerciseData.sets.reduce((sum, set) => sum + set.volume, 0);

      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: id, // ID existente
          nome: exerciseData.nome,
          ordem: exerciseData.ordem,
          total_series: exerciseTotalSeries,
          volume_total: exerciseVolumeTotal,
        })
        .select()
        .single();

      if (exerciseError) {
        console.error('Erro ao recriar exercício no update:', exerciseError);
        throw exerciseError;
      }

      // Criar sets
      const setsToInsert: ExerciseSetInsert[] = exerciseData.sets.map(set => ({
        exercise_id: exercise.id,
        series: set.series,
        repeticoes: set.repeticoes,
        peso: set.peso,
        volume: set.volume,
        ordem: set.ordem,
      }));

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(setsToInsert);

      if (setsError) {
        console.error('Erro ao recriar sets no update:', setsError);
        throw setsError;
      }
    }

    // 5. Retornar treino atualizado
    const { data: fullWorkout, error: fullWorkoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        alunos!workouts_aluno_id_fkey(id, nome, email),
        exercises(
          *,
          exercise_sets(*)
        )
      `)
      .eq('id', id)
      .single();

    if (fullWorkoutError) {
      throw fullWorkoutError;
    }

    return {
      ...fullWorkout,
      aluno: fullWorkout.alunos ? {
        id: fullWorkout.alunos.id,
        nome: fullWorkout.alunos.nome,
        email: fullWorkout.alunos.email,
      } : undefined
    };

  } catch (error) {
    console.error('Erro na função updateWorkout:', error);
    throw error;
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  try {
    if (isSupabaseOffline()) {
      throw new Error('Supabase offline: operação indisponível');
    }
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar treino:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro na função deleteWorkout:', error);
    throw error;
  }
}
