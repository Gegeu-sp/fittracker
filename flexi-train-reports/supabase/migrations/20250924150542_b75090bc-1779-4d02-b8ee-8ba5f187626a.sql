-- Create workouts table
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data_treino DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_treino TEXT,
  observacoes TEXT,
  total_exercicios INTEGER NOT NULL DEFAULT 0,
  total_series INTEGER NOT NULL DEFAULT 0,
  total_repeticoes INTEGER NOT NULL DEFAULT 0,
  volume_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  total_series INTEGER NOT NULL DEFAULT 0,
  volume_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise_sets table
CREATE TABLE public.exercise_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  series INTEGER NOT NULL,
  repeticoes TEXT NOT NULL, -- pode ser "10" ou "10/10" para unilateral
  peso DECIMAL(6,2) NOT NULL,
  volume DECIMAL(10,2) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts
CREATE POLICY "Permitir acesso de leitura a todos workouts" 
ON public.workouts 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção para todos workouts" 
ON public.workouts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos workouts" 
ON public.workouts 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão para todos workouts" 
ON public.workouts 
FOR DELETE 
USING (true);

-- Create policies for exercises
CREATE POLICY "Permitir acesso de leitura a todos exercises" 
ON public.exercises 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção para todos exercises" 
ON public.exercises 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos exercises" 
ON public.exercises 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão para todos exercises" 
ON public.exercises 
FOR DELETE 
USING (true);

-- Create policies for exercise_sets
CREATE POLICY "Permitir acesso de leitura a todos exercise_sets" 
ON public.exercise_sets 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção para todos exercise_sets" 
ON public.exercise_sets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos exercise_sets" 
ON public.exercise_sets 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão para todos exercise_sets" 
ON public.exercise_sets 
FOR DELETE 
USING (true);

-- Create trigger for workouts updated_at
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_workouts_aluno_id ON public.workouts(aluno_id);
CREATE INDEX idx_workouts_data_treino ON public.workouts(data_treino);
CREATE INDEX idx_exercises_workout_id ON public.exercises(workout_id);
CREATE INDEX idx_exercise_sets_exercise_id ON public.exercise_sets(exercise_id);