import { useState, useEffect } from "react";
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

  Target,

  TrendingUp,

  Zap,

  Download,

  Instagram,

  Save,

  Users,

  Send,

  MessageCircle,

  Phone

} from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { getAlunos } from "@/services/apiAlunos";

import { createWorkout, updateWorkout } from "@/services/apiWorkouts";

import { sendWorkoutImage } from "@/services/apiWhatsapp";

import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";

import type { Database } from "@/integrations/supabase/types";



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



interface ExerciseSet {

  sets: number;

  reps: number | string; // pode ser "10/10" para unilateral

  weight: number;

  volume: number;

}



interface Exercise {

  name: string;

  details: ExerciseSet[];

  totalVolume: number;

  totalSets: number;

}



interface ParsedWorkout {

  exercises: Exercise[];

  totalSets: number;

  totalReps: number;

  totalVolume: number;

  summary: string;

}

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

  // Lógica de Densidade para layouts compactos
  const exerciseCount = parsedWorkout.exercises.length;
  const isDense = exerciseCount > 6;
  const isSuperDense = exerciseCount > 9;

  // Ajuste dinâmico do tamanho da fonte do título baseado no comprimento do nome
  const nameLength = studentName.length;
  const titleFontSize = nameLength > 20 ? '36px' : nameLength > 15 ? '40px' : '48px';

  return (
    <div id={id} style={{
      position: 'fixed', 
      top: '-9999px', 
      left: '-9999px',
      width: '720px', 
      height: '1280px', // Altura fixa garantida
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        
        .slide { 
          width: 720px; 
          height: 1280px; 
          background: linear-gradient(135deg, #0a2d5c 0%, #1565c0 100%); 
          color: white; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          position: relative; 
          font-family: 'Montserrat', sans-serif; 
        }
        
        .slide::before { 
          content: ''; 
          position: absolute; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background-image: url('https://sfile.chatglm.cn/images-ppt/d8933323b2a7.png'); 
          background-size: cover; 
          background-position: center; 
          opacity: 0.08; 
          z-index: 0; 
        }
        
        /* Ajuste de padding condicional - Aumentado Topo para evitar cortes */
        .content { 
          padding: ${isDense ? '30px 25px 20px' : '50px 30px 30px'}; 
          display: flex; 
          flex-direction: column; 
          justify-content: flex-start; /* Fluxo natural do topo para baixo */
          gap: ${isDense ? '10px' : '20px'};
          height: 100%; 
          z-index: 1; 
          position: relative; 
        }
        
        .header { 
          text-align: center; 
          margin-bottom: ${isDense ? '10px' : '20px'}; 
          flex-shrink: 0;
        }
        
        .title { 
          font-size: ${titleFontSize}; 
          font-weight: 900; 
          color: #ffffff; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          line-height: 1.3; 
          margin-bottom: ${isDense ? '5px' : '10px'}; 
          text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
          padding-bottom: 5px; /* Margem de segurança para descendentes */
          
          /* Truncamento de nome longo */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          max-width: 100%;
        }
        
        .date { 
          font-size: ${isDense ? '18px' : '24px'}; 
          font-weight: 600; 
          color: #90caf9; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-top: -5px; /* Compensa o padding extra do title */
        }
        
        .date i { margin-right: 10px; font-size: ${isDense ? '18px' : '22px'}; }
        
        .main-content { 
          display: flex; 
          flex-direction: column; 
          justify-content: flex-start; /* Evita compressão vertical */
          gap: ${isSuperDense ? '12px' : isDense ? '18px' : '25px'}; 
          flex-grow: 1; 
          overflow: hidden;
          padding-bottom: 5px; /* Evita corte no último item */
        }
        
        .section { 
          background-color: rgba(255, 255, 255, 0.15); 
          border-radius: ${isDense ? '15px' : '25px'}; 
          padding: ${isSuperDense ? '12px' : isDense ? '18px' : '25px'}; 
          backdrop-filter: blur(8px); 
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        
        .section-title { 
          font-size: ${isDense ? '22px' : '32px'}; 
          font-weight: 800; 
          margin-bottom: ${isDense ? '8px' : '20px'}; 
          display: flex; 
          align-items: center; 
          color: #ffffff; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3); 
        }
        
        .section-title i { 
          margin-right: 12px; 
          font-size: ${isDense ? '20px' : '28px'}; 
          color: #ffeb3b; 
        }
        
        .exercise-list { list-style: none; padding: 0; margin: 0; }
        
        .exercise-item { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: ${isSuperDense ? '8px 0' : isDense ? '10px 0' : '14px 0'}; 
          border-bottom: 1px solid rgba(255, 255, 255, 0.15); 
        }
        
        .exercise-item:last-child { border-bottom: none; }
        
        .exercise-name { 
          font-size: ${isSuperDense ? '15px' : isDense ? '17px' : '22px'}; 
          font-weight: 700; 
          flex: 2; 
          display: flex; 
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4; /* Aumentado para evitar cortes */
          padding-bottom: 2px; /* Margem de segurança */
          padding-top: 2px;
        }
        
        .exercise-name i { 
          color: #4caf50; 
          margin-right: ${isDense ? '8px' : '12px'}; 
          font-size: ${isDense ? '16px' : '20px'}; 
        }
        
        .exercise-details { 
          display: flex; 
          gap: ${isDense ? '6px' : '12px'}; 
          flex: 3; 
          justify-content: flex-end; 
        }
        
        .exercise-stat { 
          text-align: center; 
          background-color: rgba(255, 255, 255, 0.15); 
          padding: ${isSuperDense ? '4px 6px' : isDense ? '6px 8px' : '10px 12px'}; 
          border-radius: ${isDense ? '8px' : '12px'}; 
          min-width: ${isDense ? '50px' : '80px'}; 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        
        .stat-value { 
          font-size: ${isSuperDense ? '16px' : isDense ? '18px' : '24px'}; 
          font-weight: 800; 
          color: #ffeb3b; 
          text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3); 
        }
        
        .stat-label { 
          font-size: ${isDense ? '10px' : '14px'}; 
          opacity: 0.9; 
          text-transform: uppercase; 
          font-weight: 600; 
        }
        
        .summary-stats { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: ${isDense ? '8px' : '15px'}; 
        }
        
        .summary-stat { 
          background-color: rgba(255, 255, 255, 0.15); 
          border-radius: ${isDense ? '10px' : '15px'}; 
          padding: ${isDense ? '8px' : '15px'}; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          text-align: center; 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        
        .summary-label { 
          font-size: ${isDense ? '11px' : '16px'}; 
          opacity: 0.9; 
          margin-bottom: ${isDense ? '4px' : '8px'}; 
          text-transform: uppercase; 
          font-weight: 600; 
        }
        
        .summary-value { 
          font-size: ${isDense ? '20px' : '32px'}; 
          font-weight: 800; 
          color: #ffeb3b; 
          text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3); 
        }

        /* Wrapper para proteger o rodapé */
        .footer-wrapper {
          margin-top: auto;
          flex-shrink: 0;
          width: 100%;
        }

        .footer { 
          text-align: center; 
          padding: ${isDense ? '12px' : '20px'}; 
          font-size: ${isDense ? '18px' : '28px'}; 
          font-weight: 800; 
          color: #ffeb3b; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          margin-top: ${isDense ? '15px' : '25px'}; 
          background: rgba(0, 0, 0, 0.3); 
          border-radius: ${isDense ? '15px' : '25px'}; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        
        .footer i { 
          margin-right: 15px; 
          font-size: ${isDense ? '18px' : '26px'}; 
        }
        
        .instagram { 
          font-size: ${isDense ? '14px' : '18px'}; 
          font-weight: 600; 
          color: #90caf9; 
          margin-top: 10px; 
          text-align: center; 
        }
        
        .page-info { 
          position: absolute; 
          bottom: 12px; 
          right: 18px; 
          font-size: 12px; 
          color: rgba(255,255,255,0.85); 
        }
        
        .accent-circle { 
          position: absolute; 
          border-radius: 50%; 
          background: radial-gradient(circle, rgba(144, 202, 249, 0.15) 0%, rgba(144, 202, 249, 0) 70%); 
          z-index: 0; 
        }
        
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
                <div className="summary-stat"><span className="summary-label">Total de Exercícios</span><span className="summary-value">{parsedWorkout.exercises.length}</span></div>
                <div className="summary-stat"><span className="summary-label">Total de Séries</span><span className="summary-value">{parsedWorkout.totalSets}</span></div>
                <div className="summary-stat"><span className="summary-label">Total de Repetições</span><span className="summary-value">{parsedWorkout.totalReps}</span></div>
                <div className="summary-stat"><span className="summary-label">Volume Total</span><span className="summary-value">{parsedWorkout.totalVolume.toFixed(0)} kg</span></div>
              </div>
            </div>
          </div>

          <div className="footer-wrapper">
            <div className="footer"><i className="material-icons">local_fire_department</i>Sem desculpas, só resultados!</div>
            <div className="instagram">@argeurodrigueslpo</div>
          </div>
          <div className="page-info">Página 1 de 1</div>
        </div>
      </div>
    </div>
  );
};


const WorkoutParser = () => {

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



  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);

  const usingWhatsapp = !!selectedAluno?.whatsapp;

  const fallbackTelefone = !!selectedAluno?.telefone && !usingWhatsapp;

  const targetNumber = selectedAluno?.whatsapp || selectedAluno?.telefone || "";

  const canSend = !!selectedAluno && !!targetNumber;



  // Check for edit mode

  useEffect(() => {

    // We can use a custom event or check location state if we were using useLocation

    // But since we are inside a component that might be rendered directly,

    // let's check if there's data in the navigation state

    const state = location.state as { editWorkout?: EditWorkoutState };

    if (state?.editWorkout) {

      const workout = state.editWorkout;

      setEditingId(workout.id);

      setSelectedAlunoId(workout.aluno_id);

      setDataTreino(workout.data_treino);

      setTipoTreino(workout.tipo_treino || "");



      // Convert workout structure back to text for editing

      const text = workout.exercises.map((ex: EditExercise) => {

        const header = ex.nome;

        const sets = ex.exercise_sets.map((s: EditExerciseSet) =>

          `${s.series}x${s.repeticoes}x${s.peso}kg`

        ).join('\n');

        return `${header}\n${sets}`;

      }).join('\n\n');



      setWorkoutText(text);



      // Auto-parse

      setTimeout(() => {

        const parsed = parseWorkoutText(text);

        setParsedWorkout(parsed);

      }, 500);



      // Clear state to avoid re-triggering

      window.history.replaceState({}, document.title);

    }

  }, [location.state]);



  // Carregar alunos

  useEffect(() => {

    const loadAlunos = async () => {

      try {

        const data = await getAlunos();

        setAlunos(data);

      } catch (error) {

        console.error('Erro ao carregar alunos:', error);

        toast({

          title: "Erro",

          description: "Não foi possível carregar a lista de alunos.",

          variant: "destructive"

        });

      }

    };



    loadAlunos();

  }, []);



  // Parser inteligente melhorado
  const parseWorkoutText = (text: string): ParsedWorkout => {

    const lines = text.split('\n').filter(line => line.trim() !== '');

    const exercises: Exercise[] = [];

    let currentExercise: { name: string; details: ExerciseSet[] } | null = null;



    lines.forEach(line => {

      const trimmedLine = line.trim();



      // Verifica se é uma linha de série (formato: 1x12x40kg ou 1x12 40kg)

      // Agora aceita espaço ou 'x' antes do peso

      const seriesMatch = trimmedLine.match(/^(\d+)\s*x\s*(\d+(?:\/\d+)?)(?:\s*x\s*|\s+)(\d+(?:[,.]\d+)?)\s*(?:kg)?$/i);

      if (seriesMatch && currentExercise) {

        const sets = parseInt(seriesMatch[1]);

        const reps = seriesMatch[2];

        const weight = parseFloat(seriesMatch[3].replace(',', '.'));



        // Calcula o volume considerando exercícios unilaterais

        let repsNum = 0;

        if (reps.includes('/')) {

          const [reps1, reps2] = reps.split('/').map(r => parseInt(r));

          repsNum = reps1 + reps2;

        } else {

          repsNum = parseInt(reps);

        }



        const volume = sets * repsNum * weight;



        currentExercise.details.push({

          sets,

          reps,

          weight,

          volume

        });

        return;

      }



      // Verifica se é apenas uma linha de nome de exercício (sem números)

      const exerciseNameMatch = trimmedLine.match(/^[A-Za-zÀ-ÿ0-9\s.]+$/);

      if (exerciseNameMatch && !trimmedLine.match(/^\d+x\d+/)) {

        // Se já temos um exercício atual, finalize ele

        if (currentExercise && currentExercise.details.length > 0) {

          const totalVolume = currentExercise.details.reduce((sum, detail) => sum + detail.volume, 0);

          const totalSets = currentExercise.details.reduce((sum, detail) => sum + detail.sets, 0);



          exercises.push({

            name: currentExercise.name,

            details: currentExercise.details,

            totalVolume,

            totalSets

          });

        }



        // Inicia um novo exercício

        currentExercise = {

          name: trimmedLine.charAt(0).toUpperCase() + trimmedLine.slice(1),

          details: []

        };

        return;

      }



      // Padrões para diferentes formatos com nome e séries na mesma linha

      const patterns = [

        // Formato: Nome do exercício seguido de séries

        /^([A-Za-zÀ-ÿ0-9\s.]+?)(?:\s*:|\s+)\s*(\d+\s*x\s*\d+(?:\/\d+)?\s*(?:x\s*|\s+)\d+(?:[,.]\d+)?\s*(?:kg)?(?:\s*[,;]\s*\d+\s*x\s*\d+(?:\/\d+)?\s*(?:x\s*|\s+)\d+(?:[,.]\d+)?\s*(?:kg)?)*)/i,

        // Formato tradicional: Supino 3x12 com 80kg

        /^([A-Za-zÀ-ÿ0-9\s.]+?)\s+(\d+)\s*(?:x|vezes?)\s*(\d+(?:\/\d+)?)\s*(?:repetições?|reps?)?\s*(?:com\s*)?(\d+(?:[,.]\d+)?)\s*(?:kg|quilos?)?$/i,

        // Formato: Nome 3 séries de 12 com 80kg

        /^([A-Za-zÀ-ÿ0-9\s.]+?)\s+(\d+)\s*séries?\s+de\s+(\d+(?:\/\d+)?)\s*(?:com\s*)?(\d+(?:[,.]\d+)?)\s*(?:kg|quilos?)?$/i

      ];



      // Verifica se é uma linha com nome do exercício e séries

      for (const pattern of patterns) {

        const match = trimmedLine.match(pattern);

        if (match) {

          // Se já temos um exercício atual, finalize ele

          if (currentExercise && currentExercise.details.length > 0) {

            const totalVolume = currentExercise.details.reduce((sum, detail) => sum + detail.volume, 0);

            const totalSets = currentExercise.details.reduce((sum, detail) => sum + detail.sets, 0);



            exercises.push({

              name: currentExercise.name,

              details: currentExercise.details,

              totalVolume,

              totalSets

            });

          }



          const exerciseName = match[1].trim();



          // Verifica se a linha contém múltiplas séries separadas por vírgula

          if (match[2] && match[2].includes(',')) {

            const seriesParts = match[2].split(/[,;]/);

            const details: ExerciseSet[] = [];



            seriesParts.forEach(part => {

              const seriesMatch = part.trim().match(/(\d+)\s*x\s*(\d+(?:\/\d+)?)(?:\s*x\s*|\s+)(\d+(?:[,.]\d+)?)/);

              if (seriesMatch) {

                const sets = parseInt(seriesMatch[1]);

                const reps = seriesMatch[2];

                const weight = parseFloat(seriesMatch[3].replace(',', '.'));



                let repsNum = 0;

                if (reps.includes('/')) {

                  const [reps1, reps2] = reps.split('/').map(r => parseInt(r));

                  repsNum = reps1 + reps2;

                } else {

                  repsNum = parseInt(reps);

                }



                const volume = sets * repsNum * weight;

                details.push({ sets, reps, weight, volume });

              }

            });



            currentExercise = {

              name: exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1),

              details

            };

          } else if (match[2] && match[3] && match[4]) {

            // Formato tradicional único

            const sets = parseInt(match[2]);

            const reps = match[3];

            const weight = parseFloat(match[4].replace(',', '.'));



            let repsNum = 0;

            if (reps.includes('/')) {

              const [reps1, reps2] = reps.split('/').map(r => parseInt(r));

              repsNum = reps1 + reps2;

            } else {

              repsNum = parseInt(reps);

            }



            const volume = sets * repsNum * weight;



            currentExercise = {

              name: exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1),

              details: [{ sets, reps, weight, volume }]

            };

          }

          break;

        }

      }

    });



    // Finaliza o último exercício se existir

    if (currentExercise) {

      const totalVolume = currentExercise.details.reduce((sum, detail) => sum + detail.volume, 0);

      const totalSets = currentExercise.details.reduce((sum, detail) => sum + detail.sets, 0);



      exercises.push({

        name: currentExercise.name,

        details: currentExercise.details,

        totalVolume,

        totalSets

      });

    }



    const totalSets = exercises.reduce((sum, ex) => sum + ex.totalSets, 0);

    const totalReps = exercises.reduce((sum, ex) => {

      return sum + ex.details.reduce((repSum, detail) => {

        const reps = typeof detail.reps === 'string' && detail.reps.includes('/')

          ? detail.reps.split('/').reduce((acc, r) => acc + parseInt(r), 0)

          : parseInt(detail.reps.toString());

        return repSum + (detail.sets * reps);

      }, 0);

    }, 0);

    const totalVolume = exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);



    return {

      exercises,

      totalSets,

      totalReps,

      totalVolume,

      summary: `${exercises.length} exercícios • ${totalSets} séries • ${totalReps} repetições • ${totalVolume.toFixed(1)} kg volume total`

    };

  };


  const generateImageFromHTML = async (): Promise<string | null> => {
    const element = document.getElementById("hidden-blue-card");
    if (!element) return null;
    try {
      const originalDisplay = (element as HTMLElement).style.display;
      (element as HTMLElement).style.display = 'flex';
      const fontsReady = (document as Document & { fonts?: { ready?: Promise<void> } }).fonts?.ready;
      if (fontsReady && typeof fontsReady.then === 'function') {
        await fontsReady;
      }
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 720,
        height: 1280,
      } as any);
      (element as HTMLElement).style.display = originalDisplay;
      return canvas.toDataURL("image/png");
    } catch (error) {
      return null;
    }
  };



  const createWorkoutCanvas = (): HTMLCanvasElement => {

    const canvas = document.createElement('canvas');

    canvas.width = 1080;

    canvas.height = 1920;

    const ctx = canvas.getContext('2d');

    if (!ctx || !parsedWorkout) return canvas;



    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);

    gradient.addColorStop(0, '#1a1a1a');

    gradient.addColorStop(1, '#000000');

    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, 1080, 1920);



    const circleGradient = (x: number, y: number, radius: number, opacity: number) => {

      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);

      g.addColorStop(0, `rgba(255, 140, 0, ${opacity})`);

      g.addColorStop(0.7, `rgba(255, 140, 0, 0)`);

      return g;

    };

    ctx.fillStyle = circleGradient(880, 100, 250, 0.15);

    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = circleGradient(200, 1700, 300, 0.1);

    ctx.fillRect(0, 0, 1080, 1920);



    ctx.textAlign = 'center';

    ctx.fillStyle = '#ffffff';

    ctx.font = 'bold 56px Arial';

    ctx.fillText('RELATÓRIO DE TREINO', 540, 180);



    const currentStudent = alunos.find(a => a.id === selectedAlunoId);

    const studentName = currentStudent?.nome || 'ALUNO';

    ctx.fillStyle = '#ff8c00';

    ctx.font = 'bold 72px Arial';

    ctx.fillText(studentName.toUpperCase(), 540, 280);



    const [year, month, day] = dataTreino.split('-');

    const formattedDate = `${day}/${month}`;

    ctx.fillStyle = '#ffffff';

    ctx.font = '28px Arial';

    ctx.fillText(`Data do Treino: ${formattedDate}`, 540, 340);

    ctx.font = '24px Arial';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    ctx.fillText('Personal Trainer: Argeu Rodrigues | CREF: 158814-G/SP', 540, 380);



    ctx.textAlign = 'left';

    ctx.fillStyle = '#ff8c00';

    ctx.font = 'bold 40px Arial';

    ctx.fillText('🏋️ Exercícios', 80, 480);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';

    ctx.fillRect(60, 510, 960, parsedWorkout.exercises.length * 70 + 40);

    ctx.fillStyle = '#ff8c00';

    ctx.fillRect(60, 510, 6, parsedWorkout.exercises.length * 70 + 40);



    let yPos = 570;

    parsedWorkout.exercises.forEach((exercise) => {

      ctx.fillStyle = '#ff8c00';

      ctx.font = '28px Arial';

      ctx.fillText('✓', 100, yPos);

      ctx.fillStyle = '#ffffff';

      ctx.font = 'bold 28px Arial';

      ctx.fillText(exercise.name, 140, yPos);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

      ctx.font = '24px Arial';

      ctx.textAlign = 'right';

      ctx.fillText(`${exercise.totalSets} séries | ${exercise.details.reduce((sum, d) => {

        const reps = typeof d.reps === 'string' && d.reps.includes('/')

          ? d.reps.split('/').reduce((acc, r) => acc + parseInt(r), 0)

          : parseInt(d.reps.toString());

        return sum + (d.sets * reps);

      }, 0)} reps | ${exercise.totalVolume.toFixed(1)} kg`, 980, yPos);

      ctx.textAlign = 'left';

      yPos += 70;

    });



    const summaryY = yPos + 60;

    ctx.fillStyle = '#ff8c00';

    ctx.font = 'bold 40px Arial';

    ctx.fillText('📊 Resumo', 80, summaryY);

    ctx.fillStyle = 'rgba(255, 140, 0, 0.1)';

    ctx.fillRect(60, summaryY + 30, 960, 240);

    ctx.fillStyle = '#ff8c00';

    ctx.fillRect(60, summaryY + 30, 6, 240);

    const summaryItems = [

      { value: parsedWorkout.exercises.length.toString(), label: 'Total de Exercícios' },

      { value: parsedWorkout.totalSets.toString(), label: 'Total de Séries' },

      { value: parsedWorkout.totalReps.toString(), label: 'Total de Repetições' },

      { value: parsedWorkout.totalVolume.toFixed(1), label: 'Volume Total (kg)' }

    ];

    summaryItems.forEach((item, index) => {

      const x = index % 2 === 0 ? 120 : 580;

      const y = index < 2 ? summaryY + 100 : summaryY + 200;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

      ctx.fillRect(x, y - 60, 380, 90);

      ctx.fillStyle = '#ff8c00';

      ctx.fillRect(x, y + 28, 380, 2);

      ctx.fillStyle = '#ff8c00';

      ctx.font = 'bold 48px Arial';

      ctx.textAlign = 'center';

      ctx.fillText(item.value, x + 190, y - 10);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

      ctx.font = '20px Arial';

      ctx.fillText(item.label, x + 190, y + 20);

    });

    ctx.textAlign = 'center';

    ctx.fillStyle = '#ff8c00';

    ctx.font = 'bold 48px Arial';

    ctx.fillText('🚀 ÓTIMO TRABALHO!', 540, 1750);

    ctx.fillStyle = '#ffffff';

    ctx.font = 'bold 32px Arial';

    ctx.fillText('📷 @argeurodrigueslpo', 540, 1820);

    return canvas;

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



  const generateWorkoutImageBase64 = async (): Promise<string | null> => {
    if (!parsedWorkout) return null;
    const dataUrl = await generateImageFromHTML();
    if (!dataUrl) return null;
    const parts = dataUrl.split(',');
    return parts.length > 1 ? parts[1] : null;
  };



  const handleParseWorkout = async () => {

    if (!workoutText.trim()) {

      toast({

        title: "Erro",

        description: "Por favor, insira a descrição do treino.",

        variant: "destructive"

      });

      return;

    }



    setIsLoading(true);



    // Simula processamento no backend

    setTimeout(() => {

      try {

        const parsed = parseWorkoutText(workoutText);

        setParsedWorkout(parsed);

        toast({

          title: "Treino processado com sucesso!",

          description: `${parsed.exercises.length} exercícios identificados.`,

        });

      } catch (error) {

        toast({

          title: "Erro no processamento",

          description: "Não foi possível processar o treino. Verifique o formato.",

          variant: "destructive"

        });

      } finally {

        setIsLoading(false);

      }

    }, 1500);

  };



  const exampleText = `Agachamento livre

1x12x40kg

1x10x50kg

1x8x60kg

1x6x70kg



Supino inclinado

3x12x20kg

1x10x20kg

1x8x20kg



Rosca direta unil.

1x12x6kg

2x10/10x8kg

1x8/8x10kg



Leg press

3x12x100kg

1x20x80kg`;



  const handleUseExample = () => {

    setWorkoutText(exampleText);

    setParsedWorkout(null);

  };



  const handleSaveWorkout = async () => {

    if (!parsedWorkout || !selectedAlunoId) {

      toast({

        title: "Erro",

        description: "Selecione um aluno e processe o treino antes de salvar.",

        variant: "destructive"

      });

      return;

    }



    setIsSaving(true);



    try {

      // Converter dados do parser para o formato da API

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



      if (editingId) {

        await updateWorkout(editingId, {

          alunoId: selectedAlunoId,

          dataTreino,

          tipoTreino: tipoTreino || undefined,

          exercises: exercisesData,

        });

      } else {

        await createWorkout({

          alunoId: selectedAlunoId,

          dataTreino,

          tipoTreino: tipoTreino || undefined,

          exercises: exercisesData,

        });

      }



      const selectedAluno = alunos.find(a => a.id === selectedAlunoId);



      toast({

        title: editingId ? "Treino atualizado!" : "Treino salvo com sucesso!",

        description: `Treino de ${selectedAluno?.nome} foi ${editingId ? 'atualizado' : 'registrado'} no sistema.`,

      });



      // Resetar formulário

      setWorkoutText("");

      setParsedWorkout(null);

      setSelectedAlunoId("");

      setTipoTreino("");

      setEditingId(null);

      setDataTreino(new Date().toISOString().split('T')[0]);



    } catch (error) {

      console.error('Erro ao salvar treino:', error);

      toast({

        title: "Erro ao salvar treino",

        description: "Não foi possível salvar o treino. Tente novamente.",

        variant: "destructive"

      });

    } finally {

      setIsSaving(false);

    }

  };



  return (

    <div className="min-h-screen bg-subtle-gradient p-6">
      <BlueWorkoutCard 
        id="hidden-blue-card"
        parsedWorkout={parsedWorkout}
        studentName={selectedAluno?.nome || "ALUNO"}
        date={dataTreino.split('-').reverse().join('/')}
      />

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}

        <div className="text-center space-y-4">

          <h1 className="text-3xl md:text-4xl font-bold text-gradient flex items-center justify-center gap-3">

            <Brain className="h-8 w-8 text-primary" />

            Parser Inteligente de Treinos

          </h1>

          <p className="text-lg text-muted-foreground">

            Transforme descrições em texto em relatórios estruturados automaticamente

          </p>

        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input Section */}

          <Card className="card-fitness">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">

                <Activity className="h-5 w-5 text-primary" />

                Descrição do Treino

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              {/* Seleção de Aluno */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">

                  <Label>Aluno *</Label>

                  <Select value={selectedAlunoId} onValueChange={setSelectedAlunoId}>

                    <SelectTrigger>

                      <SelectValue placeholder="Selecione um aluno" />

                    </SelectTrigger>

                    <SelectContent>

                      {alunos.map((aluno) => (

                        <SelectItem key={aluno.id} value={aluno.id}>

                          {aluno.nome}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>



                <div className="space-y-2">

                  <Label>Data do Treino</Label>

                  <Input

                    type="date"

                    value={dataTreino}

                    onChange={(e) => setDataTreino(e.target.value)}

                  />

                </div>

              </div>



              <div className="space-y-2">

                <Label>Tipo de Treino (opcional)</Label>

                <Input

                  placeholder="Ex: Treino A - Peito/Tríceps"

                  value={tipoTreino}

                  onChange={(e) => setTipoTreino(e.target.value)}

                />

              </div>



              <div className="space-y-2">

                <Label htmlFor="workout-text">Cole ou digite a descrição do treino:</Label>

                <Textarea

                  id="workout-text"

                  placeholder="Exemplo: Supino reto 3x12 com 80kg&#10;Desenvolvimento 4x10 com 32,5kg&#10;Crucifixo 3x15 com 20kg"

                  className="min-h-[200px] bg-input border-border focus:border-primary resize-none"

                  value={workoutText}

                  onChange={(e) => setWorkoutText(e.target.value)}

                />

              </div>



              <div className="flex gap-3">

                <Button

                  onClick={handleParseWorkout}

                  disabled={isLoading}

                  className="btn-fitness flex-1"

                >

                  {isLoading ? (

                    <>

                      <Zap className="h-4 w-4 mr-2 animate-spin" />

                      Processando...

                    </>

                  ) : (

                    <>

                      <Brain className="h-4 w-4 mr-2" />

                      Processar Treino

                    </>

                  )}

                </Button>



                <Button

                  variant="outline"

                  onClick={handleUseExample}

                  className="border-primary/30 hover:bg-primary/10"

                >

                  Usar Exemplo

                </Button>

              </div>



              {/* Botão de Salvar */}

              {parsedWorkout && (

                <div className="pt-4 border-t border-border">

                  <Button

                    onClick={handleSaveWorkout}

                    disabled={isSaving || !selectedAlunoId}

                    className="btn-fitness w-full"

                  >

                    {isSaving ? (

                      <>

                        <Zap className="h-4 w-4 mr-2 animate-spin" />

                        Salvando Treino...

                      </>

                    ) : (

                      <>

                        <Save className="h-4 w-4 mr-2" />

                        {editingId ? "Atualizar Treino" : "Salvar no Sistema"}

                      </>

                    )}

                  </Button>

                </div>

              )}



              {/* Formato de Entrada */}

              <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">

                <h4 className="font-medium text-sm mb-2 text-primary">Formatos Suportados:</h4>

                <ul className="text-xs text-muted-foreground space-y-1">

                  <li>• <strong>Variação de carga:</strong> 1x12x40kg, 1x10x50kg</li>

                  <li>• <strong>Carga constante:</strong> 3x12x20kg, 1x10x20kg</li>

                  <li>• <strong>Exercício unilateral:</strong> 2x10/10x8kg</li>

                  <li>• <strong>Drop-set:</strong> 3x12x100kg, 1x20x80kg</li>

                  <li>• <strong>Formato tradicional:</strong> "Supino 3x12 com 80kg"</li>

                  <li>• Vírgula como separador decimal (57,5kg)</li>

                </ul>

              </div>

            </CardContent>

          </Card>



          {/* Output Section */}

          <Card className="card-fitness">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">

                <CheckCircle className={`h-5 w-5 ${parsedWorkout ? 'text-success' : 'text-muted-foreground'}`} />

                Resultado do Processamento

              </CardTitle>

            </CardHeader>

            <CardContent>

              {parsedWorkout ? (

                <div className="space-y-6 animate-slide-up">

                  {/* Summary Stats */}

                  <div className="grid grid-cols-2 gap-4">

                    <div className="bg-primary/10 p-3 rounded-lg text-center">

                      <div className="text-2xl font-bold text-primary">{parsedWorkout.totalSets}</div>

                      <div className="text-xs text-muted-foreground">Séries Totais</div>

                    </div>

                    <div className="bg-primary/10 p-3 rounded-lg text-center">

                      <div className="text-2xl font-bold text-primary">{parsedWorkout.totalReps}</div>

                      <div className="text-xs text-muted-foreground">Repetições</div>

                    </div>

                  </div>



                  <div className="bg-fitness-gradient p-4 rounded-lg text-center">

                    <div className="text-3xl font-bold text-black">{parsedWorkout.totalVolume} kg</div>

                    <div className="text-sm text-black/80">Volume Total</div>

                  </div>



                  {/* Exercises List */}

                  <div className="space-y-3">

                    <div className="flex justify-between items-center">

                      <h4 className="font-medium text-primary flex items-center gap-2">

                        <Target className="h-4 w-4" />

                        Exercícios Identificados

                      </h4>

                      <div className="flex items-center gap-2">

                        {selectedAluno && (

                          <Badge

                            variant="outline"

                            className={

                              usingWhatsapp

                                ? "border-green-300 text-green-700"

                                : fallbackTelefone

                                  ? "border-amber-300 text-amber-700"

                                  : "border-destructive/30 text-destructive"

                            }

                          >

                            {usingWhatsapp ? (

                              <>

                                <MessageCircle className="h-4 w-4 mr-1" />

                                Via WhatsApp: {selectedAluno.whatsapp}

                              </>

                            ) : fallbackTelefone ? (

                              <>

                                <Phone className="h-4 w-4 mr-1" />

                                Via Telefone: {selectedAluno.telefone}

                              </>

                            ) : (

                              <>Sem número cadastrado</>

                            )}

                          </Badge>

                        )}

                        <Button

                          size="sm"

                          onClick={generateInstagramStory}

                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"

                        >

                          <Instagram className="h-4 w-4 mr-2" />

                          Story IG

                        </Button>

                        <Button

                          size="sm"

                          onClick={async () => {

                            if (!parsedWorkout || !selectedAlunoId) {

                              toast({ title: "Erro", description: "Selecione um aluno e processe o treino.", variant: "destructive" });

                              return;

                            }

                            const base64 = await generateWorkoutImageBase64();

                            if (!base64) {

                              toast({ title: "Erro", description: "Falha ao gerar imagem do treino.", variant: "destructive" });

                              return;

                            }

                            const aluno = selectedAluno;

                            const phoneLabel = targetNumber;

                            if (!phoneLabel) {

                              toast({ title: "Telefone ausente", description: "Preencha o WhatsApp no cadastro do aluno.", variant: "destructive" });

                              return;

                            }

                            toast({ title: "Enviando", description: `Enviando para ${phoneLabel}...` });

                            const instanceName = localStorage.getItem('whatsapp_instance_name') || 'Personal';

                            const caption = `Treino ${dataTreino}${tipoTreino ? ` - ${tipoTreino}` : ''}`;

                            try {

                              await sendWorkoutImage(instanceName, phoneLabel, base64, caption);

                              toast({ title: "Enviado", description: "Treino enviado via WhatsApp." });

                            } catch (err) {

                              toast({ title: "Erro ao enviar", description: "Verifique conexão do WhatsApp.", variant: "destructive" });

                            }

                          }}

                          disabled={!canSend}

                          className="bg-green-600 hover:bg-green-700 text-white"

                        >

                          <Send className="h-4 w-4 mr-2" />

                          Enviar WhatsApp

                        </Button>

                      </div>

                      </div>

                    {parsedWorkout.exercises.map((exercise, index) => (

                      <div key={index} className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">

                        <div className="flex justify-between items-start mb-2">

                          <h5 className="font-medium text-foreground">{exercise.name}</h5>

                          <Badge variant="outline" className="border-primary/30 text-primary">

                            {exercise.totalVolume.toFixed(1)} kg

                          </Badge>

                        </div>

                        <div className="space-y-1">

                          {exercise.details.map((detail, detailIndex) => (

                            <div key={detailIndex} className="text-sm text-muted-foreground">

                              {detail.sets} série{detail.sets > 1 ? 's' : ''} × {detail.reps} rep × {detail.weight} kg = {detail.volume.toFixed(1)} kg

                            </div>

                          ))}

                        </div>

                      </div>

                    ))}

                  </div>



                  {/* Summary */}

                  <div className="bg-success/10 p-4 rounded-lg border border-success/20">

                    <div className="flex items-center gap-2 mb-2">

                      <TrendingUp className="h-4 w-4 text-success" />

                      <span className="font-medium text-success">Resumo do Treino</span>

                    </div>

                    <p className="text-sm text-muted-foreground">{parsedWorkout.summary}</p>

                  </div>

                </div>

              ) : (

                <div className="text-center py-12 text-muted-foreground">

                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />

                  <p>Cole a descrição do treino e clique em "Processar Treino" para ver os resultados</p>

                </div>

              )}

            </CardContent>

          </Card>

        </div>

      </div>

    </div>

  );

};



export default WorkoutParser;
