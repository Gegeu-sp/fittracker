import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Brain,
  CheckCircle,
  Activity,
  Save,
  Instagram,
  Send,
  Calendar,
  Dumbbell,
  Flame,
  BarChart
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAlunos } from "@/services/apiAlunos";
import { createWorkout, updateWorkout } from "@/services/apiWorkouts";
import { sendWorkoutImage } from "@/services/apiWhatsapp";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import type { Database } from "@/integrations/supabase/types";
import { parseWorkoutTextModel, type ParsedWorkout, type Exercise, type ExerciseSet } from "@/lib/workoutParserModel";

const BlueWorkoutCard = ({ 
  id,
  parsedWorkout, 
  studentName, 
  date 
}: { 
  id: string,
  parsedWorkout: ParsedWorkout | null, 
  studentName: string, 
  date: string 
}) => {
  if (!parsedWorkout) return null;

  return (
    <div id={id} style={{
      position: 'fixed', 
      top: '-9999px', 
      left: '-9999px',
      width: '720px', 
      height: '1280px',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        .slide { width: 720px; height: 1280px; background: linear-gradient(135deg, #0a2d5c 0%, #1565c0 100%); color: white; display: flex; flex-direction: column; overflow: hidden; position: relative; font-family: 'Montserrat', sans-serif; }
        .slide::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('https://sfile.chatglm.cn/images-ppt/d8933323b2a7.png'); background-size: cover; background-position: center; opacity: 0.08; z-index: 0; }
        .content { padding: 40px 30px; display: flex; flex-direction: column; height: 100%; z-index: 1; position: relative; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 48px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; margin-bottom: 15px; text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3); }
        .date { font-size: 24px; font-weight: 600; color: #90caf9; display: flex; align-items: center; justify-content: center; }
        .date i { margin-right: 10px; font-size: 22px; }
        .main-content { display: flex; flex-direction: column; gap: 25px; flex-grow: 1; }
        .section { background-color: rgba(255, 255, 255, 0.15); border-radius: 25px; padding: 25px; backdrop-filter: blur(8px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); }
        .section-title { font-size: 32px; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3); }
        .section-title i { margin-right: 12px; font-size: 28px; color: #ffeb3b; }
        .exercise-list { list-style: none; padding: 0; margin: 0; }
        .exercise-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.15); }
        .exercise-item:last-child { border-bottom: none; }
        .exercise-name { font-size: 22px; font-weight: 700; flex: 2; display: flex; align-items: center; }
        .exercise-name i { color: #4caf50; margin-right: 12px; font-size: 20px; }
        .exercise-details { display: flex; gap: 12px; flex: 3; justify-content: flex-end; }
        .exercise-stat { text-align: center; background-color: rgba(255, 255, 255, 0.15); padding: 10px 12px; border-radius: 12px; min-width: 80px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .stat-value { font-size: 24px; font-weight: 800; color: #ffeb3b; text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3); }
        .stat-label { font-size: 14px; opacity: 0.9; text-transform: uppercase; font-weight: 600; }
        .summary-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .summary-stat { background-color: rgba(255, 255, 255, 0.15); border-radius: 15px; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); }
        .summary-label { font-size: 16px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; }
        .summary-value { font-size: 32px; font-weight: 800; color: #ffeb3b; text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3); }
        .footer { text-align: center; padding: 20px; font-size: 28px; font-weight: 800; color: #ffeb3b; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; background: rgba(0, 0, 0, 0.3); border-radius: 25px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255, 255, 255, 0.1); }
        .footer i { margin-right: 15px; font-size: 26px; }
        .instagram { font-size: 18px; font-weight: 600; color: #90caf9; margin-top: 10px; text-align: center; }
        .page-info { position: absolute; bottom: 12px; right: 18px; font-size: 12px; color: rgba(255,255,255,0.85); }
        .accent-circle { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(144, 202, 249, 0.15) 0%, rgba(144, 202, 249, 0) 70%); z-index: 0; }
        .accent-circle-1 { width: 400px; height: 400px; top: -150px; right: -150px; }
        .accent-circle-2 { width: 400px; height: 400px; bottom: -150px; left: -150px; }
        .accent-circle-3 { width: 300px; height: 300px; top: 40%; left: -100px; }
      `}</style>

      <div className="slide">
        <div className="accent-circle accent-circle-1"></div>
        <div className="accent-circle accent-circle-2"></div>
        <div className="accent-circle accent-circle-3"></div>

        <div className="content">
          <div className="header">
            <h1 className="title">Relatório de Treino<br/>{studentName}</h1>
            <p className="date"><i className="material-icons">event</i> Data do Treino: {date}</p>
          </div>

          <div className="main-content">
            <div className="section">
              <h2 className="section-title"><i className="material-icons">fitness_center</i>Exercícios</h2>
              <ul className="exercise-list">
                {parsedWorkout.exercises.map((ex, i) => {
                  const totalRepsExercise = ex.details.reduce((sum, detail) => {
                    const reps = typeof detail.reps === 'string' && detail.reps.includes('/')
                      ? detail.reps.split('/').reduce((acc, r) => acc + parseInt(r), 0)
                      : parseInt(detail.reps.toString());
                    return sum + (detail.sets * reps);
                  }, 0);
                  const totalVolumeExercise = ex.totalVolume.toFixed(0);
                  return (
                    <li key={i} className="exercise-item">
                      <span className="exercise-name"><i className="material-icons">check_circle</i>{ex.name}</span>
                      <div className="exercise-details">
                        <div className="exercise-stat"><div className="stat-value">{ex.totalSets}</div><div className="stat-label">séries</div></div>
                        <div className="exercise-stat"><div className="stat-value">{totalRepsExercise}</div><div className="stat-label">reps</div></div>
                        <div className="exercise-stat"><div className="stat-value">{totalVolumeExercise}</div><div className="stat-label">kg</div></div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="section">
              <h2 className="section-title"><i className="material-icons">analytics</i>Resumo</h2>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="summary-label">Total de Exercícios</span>
                  <span className="summary-value">{parsedWorkout.exercises.length}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Total de Séries</span>
                  <span className="summary-value">{parsedWorkout.totalSets}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Total de Repetições</span>
                  <span className="summary-value">{parsedWorkout.totalReps}</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-label">Volume Total</span>
                  <span className="summary-value">{parsedWorkout.totalVolume.toFixed(0)} kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer"><i className="material-icons">local_fire_department</i>Sem desculpas, só resultados!</div>
          <div className="instagram">@argeurodrigueslpo</div>
          <div className="page-info">Página 1 de 1</div>
        </div>
      </div>
    </div>
  );
};

type AlunoRow = Database['public']['Tables']['alunos']['Row'];

interface EditExerciseSet {
  series: number;
  repeticoes: string;
  peso: number;
}

interface EditExercise {
  nome: string;
  exercise_sets: EditExerciseSet[];
}

interface EditWorkoutState {
  id: string | null;
  aluno_id: string;
  data_treino: string;
  tipo_treino?: string | null;
  exercises: EditExercise[];
}

// Função e tipos do parser movidos para @/lib/workoutParserModel

const WorkoutParserModel = () => {
  const location = useLocation();
  const [workoutText, setWorkoutText] = useState("");
  const [parsedWorkout, setParsedWorkout] = useState<ParsedWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alunos, setAlunos] = useState<AlunoRow[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState("");
  const [dataTreino, setDataTreino] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [tipoTreino, setTipoTreino] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const blueCardRef = useRef<HTMLDivElement>(null);

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
  const usingWhatsapp = !!selectedAluno?.whatsapp;
  const fallbackTelefone = !!selectedAluno?.telefone && !usingWhatsapp;
  const targetNumber = selectedAluno?.whatsapp || selectedAluno?.telefone || "";
  const canSend = !!selectedAluno && !!targetNumber;

  useEffect(() => {
    const state = location.state as { editWorkout?: EditWorkoutState };
    if (state?.editWorkout) {
      const workout = state.editWorkout;
      setEditingId(workout.id);
      setSelectedAlunoId(workout.aluno_id);
      setDataTreino(workout.data_treino);
      setTipoTreino(workout.tipo_treino || "");

      const text = workout.exercises.map((ex: EditExercise) => {
        const header = ex.nome;
        const sets = ex.exercise_sets.map((s: EditExerciseSet) =>
          `${s.series}x${s.repeticoes}x${s.peso}kg`
        ).join('\n');
        return `${header}\n${sets}`;
      }).join('\n\n');

      setWorkoutText(text);

      setTimeout(() => {
        const parsed = parseWorkoutTextModel(text);
        setParsedWorkout(parsed);
      }, 500);

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const loadAlunos = async () => {
      try {
        const data = await getAlunos();
        setAlunos(data);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        toast({ title: "Erro", description: "Não foi possível carregar a lista de alunos.", variant: "destructive" });
      }
    };
    loadAlunos();
  }, []);

  const generateImageFromHTML = async (): Promise<string | null> => {
    const element = document.getElementById("hidden-blue-card-model");
    if (!element) return null;
    try {
      const originalDisplay = element.style.display;
      element.style.display = 'flex';
      // Ajuste de compatibilidade de tipos: definimos opções amplas e fazemos assert
      // para o tipo de opções aceito pelas definições instaladas, preservando os
      // campos modernos necessários para o runtime.
      type Html2CanvasOptionsCompat = Parameters<typeof html2canvas>[1] & {
        scale?: number;
        windowWidth?: number;
        windowHeight?: number;
      };
      const options: Html2CanvasOptionsCompat = {
        useCORS: true,
        background: undefined,
        width: 720,
        height: 1280,
      };
      options.scale = 1;
      options.windowWidth = 720;
      options.windowHeight = 1280;
      const canvas = await html2canvas(element, options);
      element.style.display = originalDisplay;
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      return null;
    }
  };

  const generateInstagramStory = async () => {
    if (!parsedWorkout) return;
    toast({ title: "Gerando Story...", description: "Aplicando visual azul..." });
    try {
      const dataUrl = await generateImageFromHTML();
      if (dataUrl) {
        const blob = await (await fetch(dataUrl)).blob();
        const currentStudent = alunos.find(a => a.id === selectedAlunoId);
        const studentName = currentStudent?.nome.replace(/\s+/g, '_') || 'aluno';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Treino_${studentName}_${dataTreino}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "Sucesso!", description: "Imagem baixada." });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível gerar a imagem.", variant: "destructive" });
    }
  };

  const generatePdfFromHTML = async () => {
    const element = document.getElementById("hidden-blue-card-model");
    if (!element) return;
    const slide = element.querySelector('.slide') as HTMLElement | null;
    if (!slide) return;
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Relatório de Treino</title><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"><style>html,body{margin:0;padding:0;background:#fff} .slide{margin:0 auto}</style></head><body>${slide.outerHTML}</body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      try { win.print(); } catch { /* noop */ }
    }, 500);
  };

  const generateWorkoutImageBase64 = async (): Promise<string | null> => {
    const dataUrl = await generateImageFromHTML();
    if (!dataUrl) return null;
    return dataUrl.split(',')[1];
  };

  const handleParseWorkout = async () => {
    if (!workoutText.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const parsed = parseWorkoutTextModel(workoutText);
      setParsedWorkout(parsed);
      toast({ title: "Processado!", description: `${parsed.exercises.length} exercícios identificados.` });
      setIsLoading(false);
    }, 1500);
  };

  const handleUseExample = () => {
    setWorkoutText(`Agachamento livre\n1x12x40kg\n1x10x50kg\n\nSupino inclinado\n3x12x20kg`);
    setParsedWorkout(null);
  };

  const handleSaveWorkout = async () => {
    if (!parsedWorkout || !selectedAlunoId) return;
    setIsSaving(true);
    try {
      const exercisesData = parsedWorkout.exercises.map((exercise, index) => ({
        nome: exercise.name,
        ordem: index + 1,
        sets: exercise.details.map((detail, setIndex) => ({
          series: detail.sets,
          repeticoes: detail.reps.toString(),
          peso: detail.weight,
          volume: detail.volume,
          ordem: setIndex + 1,
        }))
      }));

      const payload = {
        alunoId: selectedAlunoId,
        dataTreino,
        tipoTreino: tipoTreino || undefined,
        exercises: exercisesData,
      };

      if (editingId) {
        await updateWorkout(editingId, payload);
      } else {
        await createWorkout(payload);
      }
      toast({ title: "Salvo!", description: "Treino registrado." });
      setWorkoutText("");
      setParsedWorkout(null);
      setSelectedAlunoId("");
      setTipoTreino("");
      setEditingId(null);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient p-6">
      <BlueWorkoutCard 
        id="hidden-blue-card-model"
        parsedWorkout={parsedWorkout}
        studentName={selectedAluno?.nome || "ALUNO"}
        date={dataTreino.split('-').reverse().join('/')}
      />

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Parser Inteligente (Modelo)
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-fitness">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aluno *</Label>
                  <Select value={selectedAlunoId} onValueChange={setSelectedAlunoId}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {alunos.map((aluno) => (<SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={dataTreino} onChange={(e) => setDataTreino(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo (Opcional)</Label>
                <Input placeholder="Ex: Treino A" value={tipoTreino} onChange={(e) => setTipoTreino(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Treino</Label>
                <Textarea className="min-h-[200px]" value={workoutText} onChange={(e) => setWorkoutText(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleParseWorkout} disabled={isLoading} className="btn-fitness flex-1">
                  {isLoading ? "Processando..." : "Processar"}
                </Button>
                <Button variant="outline" onClick={handleUseExample}>Exemplo</Button>
              </div>
              {parsedWorkout && (
                <div className="pt-4">
                  <Button onClick={handleSaveWorkout} disabled={isSaving || !selectedAlunoId} className="btn-fitness w-full">
                    <Save className="h-4 w-4 mr-2" /> Salvar no Sistema
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-fitness">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-success" /> Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              {parsedWorkout ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{parsedWorkout.totalSets}</div>
                      <div className="text-xs">Séries</div>
                    </div>
                    <div className="bg-fitness-gradient p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-black">{parsedWorkout.totalVolume} kg</div>
                      <div className="text-xs text-black">Volume Total</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                      <Button size="sm" onClick={generateInstagramStory} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex-1">
                        <Instagram className="h-4 w-4 mr-2" /> Baixar Story
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={generatePdfFromHTML}>Baixar PDF</Button>
                      <Button 
                        size="sm" 
                        disabled={!canSend}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        onClick={async () => {
                          if (!selectedAlunoId) return;
                          const base64 = await generateWorkoutImageBase64();
                          if (!base64) {
                              toast({ title: "Erro", description: "Falha na imagem.", variant: "destructive" });
                              return;
                          }
                          const instanceName = localStorage.getItem('whatsapp_instance_name') || 'Personal';
                          const caption = `Treino ${dataTreino} ${tipoTreino}`;
                          try {
                              await sendWorkoutImage(instanceName, targetNumber, base64, caption);
                              toast({ title: "Enviado!", description: "WhatsApp enviado." });
                          } catch (e) {
                              toast({ title: "Erro", description: "Falha no envio.", variant: "destructive" });
                          }
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" /> Enviar WhatsApp
                      </Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {parsedWorkout.exercises.map((exercise, index) => (
                      <div key={index} className="bg-secondary/10 p-3 rounded-lg border border-secondary/20 flex justify-between items-center">
                         <span className="font-medium text-sm">{exercise.name}</span>
                         <Badge variant="outline">{exercise.totalVolume} kg</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aguardando...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkoutParserModel;
