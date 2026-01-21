export interface ExerciseSet {
  sets: number;
  reps: number | string;
  weight: number;
  volume: number;
}

export interface Exercise {
  name: string;
  details: ExerciseSet[];
  totalVolume: number;
  totalSets: number;
}

export interface ParsedWorkout {
  exercises: Exercise[];
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  summary: string;
}

export const parseWorkoutTextModel = (text: string): ParsedWorkout => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const exercises: Exercise[] = [];
  let currentExercise: { name: string; details: ExerciseSet[] } | null = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Regex melhorado para suportar mais formatos
    // Ex: 1x12x40kg, 1x12 40kg, 1x12 - 40kg, 1x12 com 40kg
    const seriesMatch = trimmedLine.match(/^(\d+)\s*x\s*(\d+(?:\/\d+)?)(?:\s*x\s*|\s+(?:-|com)?\s*|\s+)(\d+(?:[,.]\d+)?)\s*(?:kgs?)?$/i);
    
    if (seriesMatch && currentExercise) {
      const sets = parseInt(seriesMatch[1]);
      const reps = seriesMatch[2];
      const weight = parseFloat(seriesMatch[3].replace(',', '.'));
      
      // Validação básica
      if (isNaN(sets) || isNaN(weight)) return;

      let repsNum = 0;
      if (reps.includes('/')) {
        const [reps1, reps2] = reps.split('/').map(r => parseInt(r));
        if (!isNaN(reps1) && !isNaN(reps2)) {
          repsNum = reps1 + reps2;
        } else {
           // Fallback se falhar parsing das reps compostas
           repsNum = parseInt(reps) || 0;
        }
      } else {
        repsNum = parseInt(reps);
      }
      
      if (isNaN(repsNum)) return;

      const volume = sets * repsNum * weight;
      currentExercise.details.push({ sets, reps, weight, volume });
      return;
    }

    // Padrões para formatos combinados (Nome + Séries na mesma linha)
    const patterns = [
        // Formato: Nome do exercício seguido de séries (Ex: Supino 3x10x20kg)
        /^([A-Za-zÀ-ÿ0-9\s.]+?)(?:\s*:|\s+)\s*(\d+\s*x\s*\d+(?:\/\d+)?\s*(?:x\s*|\s+)\d+(?:[,.]\d+)?\s*(?:kg)?(?:\s*[,;]\s*\d+\s*x\s*\d+(?:\/\d+)?\s*(?:x\s*|\s+)\d+(?:[,.]\d+)?\s*(?:kg)?)*)/i,
        // Formato tradicional: Supino 3x12 com 80kg
        /^([A-Za-zÀ-ÿ0-9\s.]+?)\s+(\d+)\s*(?:x|vezes?)\s*(\d+(?:\/\d+)?)\s*(?:repetições?|reps?)?\s*(?:com\s*)?(\d+(?:[,.]\d+)?)\s*(?:kg|quilos?)?$/i,
        // Formato: Nome 3 séries de 12 com 80kg
        /^([A-Za-zÀ-ÿ0-9\s.]+?)\s+(\d+)\s*séries?\s+de\s+(\d+(?:\/\d+)?)\s*(?:com\s*)?(\d+(?:[,.]\d+)?)\s*(?:kg|quilos?)?$/i
    ];

    for (const pattern of patterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
            // Se já temos um exercício atual, finalize ele
            if (currentExercise && currentExercise.details.length > 0) {
                const totalVolume = currentExercise.details.reduce((sum, detail) => sum + detail.volume, 0);
                const totalSets = currentExercise.details.reduce((sum, detail) => sum + detail.sets, 0);
                exercises.push({ name: currentExercise.name, details: currentExercise.details, totalVolume, totalSets });
            }

            const exerciseName = match[1].trim();
            const details: ExerciseSet[] = [];

            // Verifica se a linha contém múltiplas séries separadas por vírgula (Pattern 1)
            if (match[2] && match[2].includes(',') && patterns.indexOf(pattern) === 0) {
                const seriesParts = match[2].split(/[,;]/);
                seriesParts.forEach(part => {
                    const seriesMatch = part.trim().match(/(\d+)\s*x\s*(\d+(?:\/\d+)?)(?:\s*x\s*|\s+)(\d+(?:[,.]\d+)?)/);
                    if (seriesMatch) {
                        const sets = parseInt(seriesMatch[1]);
                        const reps = seriesMatch[2];
                        const weight = parseFloat(seriesMatch[3].replace(',', '.'));
                        
                        let repsNum = 0;
                        if (reps.includes('/')) {
                            const [reps1, reps2] = reps.split('/').map(r => parseInt(r));
                            repsNum = (!isNaN(reps1) && !isNaN(reps2)) ? reps1 + reps2 : parseInt(reps) || 0;
                        } else {
                            repsNum = parseInt(reps);
                        }

                        if (!isNaN(sets) && !isNaN(weight) && !isNaN(repsNum)) {
                            const volume = sets * repsNum * weight;
                            details.push({ sets, reps, weight, volume });
                        }
                    }
                });
            } else if (match[2] && match[3] && match[4]) {
                 // Formato único (Patterns 2 e 3, ou Pattern 1 simples)
                 const sets = parseInt(match[2]);
                 const reps = match[3];
                 const weight = parseFloat(match[4].replace(',', '.'));
                 
                 let repsNum = 0;
                 if (reps.includes('/')) {
                     const [reps1, reps2] = reps.split('/').map(r => parseInt(r));
                     repsNum = (!isNaN(reps1) && !isNaN(reps2)) ? reps1 + reps2 : parseInt(reps) || 0;
                 } else {
                     repsNum = parseInt(reps);
                 }

                 if (!isNaN(sets) && !isNaN(weight) && !isNaN(repsNum)) {
                     const volume = sets * repsNum * weight;
                     details.push({ sets, reps, weight, volume });
                 }
            }

            if (details.length > 0) {
                currentExercise = {
                    name: exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1),
                    details
                };
                return; // Match found, skip to next line
            }
        }
    }

    const exerciseNameMatch = trimmedLine.match(/^[A-Za-zÀ-ÿ0-9\s.\-\(\)]+$/);
    if (exerciseNameMatch && !trimmedLine.match(/^\d+x\d+/)) {
      if (currentExercise && currentExercise.details.length > 0) {
        const totalVolume = currentExercise.details.reduce((sum, detail) => sum + detail.volume, 0);
        const totalSets = currentExercise.details.reduce((sum, detail) => sum + detail.sets, 0);
        exercises.push({ name: currentExercise.name, details: currentExercise.details, totalVolume, totalSets });
      }
      currentExercise = { name: trimmedLine.charAt(0).toUpperCase() + trimmedLine.slice(1), details: [] };
      return;
    }
  });

  if (currentExercise && currentExercise.details.length > 0) {
    const totalVolume = currentExercise.details.reduce((sum, detail) => sum + detail.volume, 0);
    const totalSets = currentExercise.details.reduce((sum, detail) => sum + detail.sets, 0);
    exercises.push({ name: currentExercise.name, details: currentExercise.details, totalVolume, totalSets });
  }

  const totalSets = exercises.reduce((sum, ex) => sum + ex.totalSets, 0);
  const totalReps = exercises.reduce((sum, ex) => {
    return sum + ex.details.reduce((repSum, detail) => {
      const reps = typeof detail.reps === 'string' && detail.reps.includes('/') ? detail.reps.split('/').reduce((acc, r) => acc + parseInt(r), 0) : parseInt(detail.reps.toString());
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

