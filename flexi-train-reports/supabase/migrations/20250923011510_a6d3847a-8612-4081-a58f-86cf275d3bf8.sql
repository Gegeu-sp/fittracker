-- Criar tabela alunos
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'pausado', 'inativo')) DEFAULT 'ativo',
  foto_url TEXT,
  objetivo TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_alunos_status ON public.alunos(status);
CREATE INDEX idx_alunos_email ON public.alunos(email);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns dados de exemplo
INSERT INTO public.alunos (nome, email, telefone, status, objetivo) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-0001', 'ativo', 'Perda de peso e condicionamento'),
('Maria Santos', 'maria.santos@email.com', '(11) 99999-0002', 'ativo', 'Ganho de massa muscular'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99999-0003', 'pausado', 'Fortalecimento e reabilitação'),
('Ana Costa', 'ana.costa@email.com', '(11) 99999-0004', 'ativo', 'Condicionamento físico geral'),
('Carlos Souza', 'carlos.souza@email.com', '(11) 99999-0005', 'inativo', 'Preparação para maratona');