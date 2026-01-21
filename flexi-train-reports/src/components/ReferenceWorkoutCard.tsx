import React from 'react';
import { ParsedWorkout } from '@/lib/workoutParserModel';

interface ReferenceWorkoutCardProps {
  workout: ParsedWorkout;
  studentName?: string;
  date?: string;
}

export const ReferenceWorkoutCard: React.FC<ReferenceWorkoutCardProps> = ({ 
  workout, 
  studentName = "Aluno", 
  date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) 
}) => {
  // Calcular total de repetições por exercício para exibição correta no card
  const exercisesWithReps = workout.exercises.map(ex => {
    // Tenta obter o total de repetições somando sets * reps de cada detalhe
    // Se o parser já não forneceu (o parser atual não calcula totalReps per exercise na interface Exercise, só no detalhe)
    const totalReps = ex.details.reduce((sum, detail) => {
        const repsVal = detail.reps.toString();
        let currentReps = 0;
        
        // Trata formatos como "10/10" (dropset ou combinado)
        if (repsVal.includes('/')) {
            const parts = repsVal.split('/').map(r => parseInt(r.trim()));
            // Soma as partes se forem números válidos
            currentReps = parts.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
        } else {
            currentReps = parseInt(repsVal) || 0;
        }
        
        return sum + (detail.sets * currentReps);
    }, 0);
    
    return { ...ex, totalReps };
  });

  // Totais para o resumo
  const totalExercises = workout.exercises.length;
  const globalSets = workout.totalSets;
  // Se workout.totalReps for 0 ou indefinido, calcula soma
  const globalReps = workout.totalReps || exercisesWithReps.reduce((sum, ex) => sum + ex.totalReps, 0);
  const globalVolume = workout.totalVolume;

  return (
    <div id="model-parser-root">
      <style>{`
        /* Importação de fontes */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        /* Reset e estilos base escopados pelo ID */
        #model-parser-root * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Montserrat', sans-serif;
        }

        #model-parser-root {
            display: flex;
            justify-content: center;
            align-items: center;
            /* Remove padding/bg do body original para não interferir no componente */
        }

        #model-parser-root .slide {
            width: 720px;
            height: 1280px;
            min-height: 1280px;
            background: linear-gradient(135deg, #0a2d5c 0%, #1565c0 100%);
            color: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }

        #model-parser-root .slide::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('https://sfile.chatglm.cn/images-ppt/d8933323b2a7.png');
            background-size: cover;
            background-position: center;
            opacity: 0.08;
            z-index: 0;
            pointer-events: none;
        }

        #model-parser-root .content {
            padding: 40px 30px;
            display: flex;
            flex-direction: column;
            height: 100%;
            z-index: 1;
            position: relative;
        }

        #model-parser-root .header {
            text-align: center;
            margin-bottom: 30px;
            flex-shrink: 0;
        }

        #model-parser-root .title {
            font-size: 48px;
            font-weight: 900;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            line-height: 1.1;
            margin-bottom: 15px;
            text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
        }

        #model-parser-root .date {
            font-size: 24px;
            font-weight: 600;
            color: #90caf9;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #model-parser-root .date i {
            margin-right: 10px;
            font-size: 22px;
        }

        #model-parser-root .main-content {
            display: flex;
            flex-direction: column;
            gap: 25px;
            flex-grow: 1;
            justify-content: flex-start;
        }

        #model-parser-root .section {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 25px;
            padding: 25px;
            backdrop-filter: blur(8px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        #model-parser-root .section-title {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
        }

        #model-parser-root .section-title i {
            margin-right: 12px;
            font-size: 28px;
            color: #ffeb3b;
        }

        #model-parser-root .exercise-list {
            list-style: none;
        }

        #model-parser-root .exercise-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        #model-parser-root .exercise-item:last-child {
            border-bottom: none;
        }

        #model-parser-root .exercise-name {
            font-size: 22px;
            font-weight: 700;
            flex: 2;
            display: flex;
            align-items: center;
            line-height: 1.2;
        }

        #model-parser-root .exercise-name i {
            color: #4caf50;
            margin-right: 12px;
            font-size: 24px;
            min-width: 24px;
        }

        #model-parser-root .exercise-details {
            display: flex;
            gap: 12px;
            flex: 3;
            justify-content: flex-end;
        }

        #model-parser-root .exercise-stat {
            text-align: center;
            background-color: rgba(255, 255, 255, 0.15);
            padding: 10px 8px;
            border-radius: 12px;
            min-width: 75px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        #model-parser-root .stat-value {
            font-size: 22px;
            font-weight: 800;
            color: #ffeb3b;
            text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
            line-height: 1;
            margin-bottom: 4px;
        }

        #model-parser-root .stat-label {
            font-size: 12px;
            opacity: 0.9;
            text-transform: uppercase;
            font-weight: 600;
            line-height: 1;
        }

        #model-parser-root .summary-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        #model-parser-root .summary-stat {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        #model-parser-root .summary-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-weight: 600;
        }

        #model-parser-root .summary-value {
            font-size: 36px;
            font-weight: 800;
            color: #ffeb3b;
            text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
        }

        #model-parser-root .footer {
            text-align: center;
            padding: 20px;
            font-size: 24px;
            font-weight: 800;
            color: #ffeb3b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: auto;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            flex-shrink: 0;
        }

        #model-parser-root .footer i {
            margin-right: 15px;
            font-size: 28px;
        }

        #model-parser-root .accent-circle {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(144, 202, 249, 0.15) 0%, rgba(144, 202, 249, 0) 70%);
            z-index: 0;
            pointer-events: none;
        }

        #model-parser-root .accent-circle-1 {
            width: 400px;
            height: 400px;
            top: -150px;
            right: -150px;
        }

        #model-parser-root .accent-circle-2 {
            width: 400px;
            height: 400px;
            bottom: -150px;
            left: -150px;
        }

        #model-parser-root .accent-circle-3 {
            width: 300px;
            height: 300px;
            top: 40%;
            left: -100px;
        }

        #model-parser-root .instagram {
            font-size: 18px;
            font-weight: 600;
            color: #90caf9;
            margin-top: 15px;
            text-align: center;
            flex-shrink: 0;
        }
      `}</style>

      <div className="slide" id="capture-target">
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
                    <h2 className="section-title">
                        <i className="material-icons">fitness_center</i>
                        Exercícios
                    </h2>
                    <ul className="exercise-list">
                        {exercisesWithReps.map((ex, idx) => (
                            <li key={idx} className="exercise-item">
                                <span className="exercise-name"><i className="material-icons">check_circle</i>{ex.name}</span>
                                <div className="exercise-details">
                                    <div className="exercise-stat">
                                        <div className="stat-value">{ex.totalSets}</div>
                                        <div className="stat-label">séries</div>
                                    </div>
                                    <div className="exercise-stat">
                                        <div className="stat-value">{ex.totalReps}</div>
                                        <div className="stat-label">reps</div>
                                    </div>
                                    <div className="exercise-stat">
                                        <div className="stat-value">{Math.round(ex.totalVolume)}</div>
                                        <div className="stat-label">kg</div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="section">
                    <h2 className="section-title">
                        <i className="material-icons">analytics</i>
                        Resumo
                    </h2>
                    <div className="summary-stats">
                        <div className="summary-stat">
                            <span className="summary-label">Total de Exercícios</span>
                            <span className="summary-value">{totalExercises}</span>
                        </div>
                        <div className="summary-stat">
                            <span className="summary-label">Total de Séries</span>
                            <span className="summary-value">{globalSets}</span>
                        </div>
                        <div className="summary-stat">
                            <span className="summary-label">Total de Repetições</span>
                            <span className="summary-value">{globalReps}</span>
                        </div>
                        <div className="summary-stat">
                            <span className="summary-label">Volume Total</span>
                            <span className="summary-value">{Math.round(globalVolume)} kg</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="footer">
                <i className="material-icons">local_fire_department</i>
                Sem desculpas, só resultados!
            </div>
            
            <div className="instagram">@argeurodrigueslpo</div>
        </div>
      </div>
    </div>
  );
};
