import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateDisplay } from "@/lib/utils";
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Eye,
  MoreVertical,
  Loader2,
  Trash2,
  MessageCircle
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { getAlunos, deleteAluno } from "@/services/apiAlunos";
import type { Database } from "@/integrations/supabase/types";
import StudentForm from "./StudentForm";
import ConfirmDialog from "./ConfirmDialog";
import { safeAvatarSrc } from "@/lib/utils";

type AlunoRow = Database['public']['Tables']['alunos']['Row'];

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [alunos, setAlunos] = useState<AlunoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AlunoRow | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<AlunoRow | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshAlunos();
  }, []);

  const filteredStudents = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-success text-success-foreground';
      case 'pausado': return 'bg-warning text-warning-foreground';
      case 'inativo': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'pausado': return 'Pausado';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const refreshAlunos = async () => {
    try {
      setLoading(true);
      const data = await getAlunos();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = () => {
    setSelectedStudent(undefined);
    setFormOpen(true);
  };

  const handleEditStudent = (student: AlunoRow) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleDeleteClick = (student: AlunoRow) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteAluno(studentToDelete.id);
      toast({
        title: "Aluno removido",
        description: `${studentToDelete.nome} foi removido com sucesso.`,
      });
      await refreshAlunos();
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setStudentToDelete(undefined);
    }
  };

  const handleFormSuccess = async () => {
    await refreshAlunos();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return formatDateDisplay(dateString);
  };

  return (
    <div className="min-h-screen bg-subtle-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Gerenciar Alunos
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {loading ? "Carregando..." : `${filteredStudents.length} alunos encontrados`}
            </p>
          </div>
          
          <Button 
            className="btn-fitness"
            onClick={handleCreateStudent}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </Button>
        </div>

        {/* Search */}
        <Card className="card-fitness">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar alunos por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="card-fitness">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Students Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((aluno) => (
              <Card 
                key={aluno.id} 
                className="card-fitness hover-glow group cursor-pointer transition-all hover:scale-[1.02]"
                onClick={() => navigate(`/students/${aluno.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={safeAvatarSrc(aluno.foto_url)} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(aluno.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-foreground truncate max-w-[150px] md:max-w-[200px]" title={aluno.nome}>{aluno.nome}</CardTitle>
                        <Badge className={`text-xs ${getStatusColor(aluno.status)}`}>
                          {getStatusText(aluno.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditStudent(aluno);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/students/${aluno.id}`);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(aluno);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{aluno.email}</span>
                    </div>
                    {aluno.telefone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{aluno.telefone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>{aluno.whatsapp || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Cadastro: {formatDate(aluno.created_at)}</span>
                    </div>
                  </div>

                  {/* Objetivo */}
                  {aluno.objetivo && (
                    <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                      <div className="text-sm text-muted-foreground mb-1">Objetivo:</div>
                      <div className="text-sm font-medium text-foreground">
                        {aluno.objetivo}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredStudents.length === 0 && (
          <Card className="card-fitness">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Comece adicionando seu primeiro aluno'}
              </p>
              <Button 
                className="btn-fitness"
                onClick={handleCreateStudent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Aluno
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Dialog */}
      <StudentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        student={selectedStudent}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setStudentToDelete(undefined);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Aluno"
        description={`Tem certeza que deseja excluir ${studentToDelete?.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
};

export default StudentList;
