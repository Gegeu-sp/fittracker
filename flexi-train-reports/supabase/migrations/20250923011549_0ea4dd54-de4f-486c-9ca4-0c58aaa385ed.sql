-- Habilitar Row Level Security na tabela alunos
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para permitir acesso público (temporário, sem autenticação)
CREATE POLICY "Permitir acesso de leitura a todos" 
ON public.alunos 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção para todos" 
ON public.alunos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos" 
ON public.alunos 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão para todos" 
ON public.alunos 
FOR DELETE 
USING (true);