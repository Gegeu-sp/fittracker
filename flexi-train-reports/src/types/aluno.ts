export interface Aluno {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone?: string;
  whatsapp: string | null;
  status: 'ativo' | 'pausado' | 'inativo';
  foto_url?: string;
  objetivo?: string;
  updated_at: string;
}

export interface CreateAlunoData {
  nome: string;
  email: string;
  telefone?: string;
  whatsapp?: string | null;
  status?: 'ativo' | 'pausado' | 'inativo';
  foto_url?: string;
  objetivo?: string;
}

export interface UpdateAlunoData {
  nome?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string | null;
  status?: 'ativo' | 'pausado' | 'inativo';
  foto_url?: string;
  objetivo?: string;
}
