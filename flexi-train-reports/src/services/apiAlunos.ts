import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AlunoRow = Database['public']['Tables']['alunos']['Row'];
type AlunoInsert = Database['public']['Tables']['alunos']['Insert'];
type AlunoUpdate = Database['public']['Tables']['alunos']['Update'];

function isSupabaseOffline(): boolean {
  try {
    return localStorage.getItem('supabase_offline') === 'true';
  } catch {
    return false;
  }
}

export async function getAlunos(): Promise<AlunoRow[]> {
  try {
    if (isSupabaseOffline()) {
      return [];
    }
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar alunos:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro na função getAlunos:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Erro de rede detectado ao buscar alunos. Retornando lista vazia.');
      return [];
    }
    throw error;
  }
}

export async function getAlunoById(id: string): Promise<AlunoRow | null> {
  try {
    if (isSupabaseOffline()) {
      return null;
    }
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar aluno por id:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro na função getAlunoById:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Erro de rede detectado ao buscar aluno por id. Retornando null.');
      return null;
    }
    throw error;
  }
}

export async function createAluno(alunoData: AlunoInsert): Promise<AlunoRow> {
  try {
    if (isSupabaseOffline()) {
      throw new Error('Supabase offline: operação indisponível');
    }
    const { data, error } = await supabase
      .from('alunos')
      .insert([alunoData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro na função createAluno:', error);
    throw error;
  }
}

export async function updateAluno(id: string, alunoData: AlunoUpdate): Promise<AlunoRow> {
  try {
    if (isSupabaseOffline()) {
      throw new Error('Supabase offline: operação indisponível');
    }
    const { data, error } = await supabase
      .from('alunos')
      .update(alunoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro na função updateAluno:', error);
    throw error;
  }
}

export async function deleteAluno(id: string): Promise<void> {
  try {
    if (isSupabaseOffline()) {
      throw new Error('Supabase offline: operação indisponível');
    }
    // Garantir integridade: remover treinos e dependências antes do aluno
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('id')
      .eq('aluno_id', id);

    if (workoutsError) {
      console.error('Erro ao buscar treinos do aluno antes da exclusão:', workoutsError);
      throw workoutsError;
    }

    if (workouts && workouts.length > 0) {
      for (const workout of workouts) {
        // Buscar exercícios do treino
        const { data: exercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('id')
          .eq('workout_id', workout.id);

        if (exercisesError) {
          console.error('Erro ao buscar exercícios do treino antes da exclusão:', exercisesError);
          throw exercisesError;
        }

        // Deletar sets de cada exercício (se não houver cascade no banco)
        if (exercises && exercises.length > 0) {
          for (const exercise of exercises) {
            const { error: setsError } = await supabase
              .from('exercise_sets')
              .delete()
              .eq('exercise_id', exercise.id);
            if (setsError) {
              console.error('Erro ao deletar sets do exercício:', setsError);
              throw setsError;
            }
          }
        }

        // Deletar exercícios do treino
        const { error: delExercisesError } = await supabase
          .from('exercises')
          .delete()
          .eq('workout_id', workout.id);
        if (delExercisesError) {
          console.error('Erro ao deletar exercícios do treino:', delExercisesError);
          throw delExercisesError;
        }

        // Deletar o treino
        const { error: delWorkoutError } = await supabase
          .from('workouts')
          .delete()
          .eq('id', workout.id);
        if (delWorkoutError) {
          console.error('Erro ao deletar treino:', delWorkoutError);
          throw delWorkoutError;
        }
      }
    }

    // Por fim, deletar o aluno
    const { error: deleteAlunoError } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (deleteAlunoError) {
      console.error('Erro ao deletar aluno:', deleteAlunoError);
      throw deleteAlunoError;
    }
  } catch (error) {
    console.error('Erro na função deleteAluno:', error);
    throw error;
  }
}
