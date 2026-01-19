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
    const seriesMatch = trimmedLine.match(/^(\d+)\s*x\s*(\d+(?:\/\d+)?)(?:\s*x\s*|\s+)(\d+(?:[,.]\d+)?)\s*(?:kg)?$/i);
    if (seriesMatch && currentExercise) {
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
      currentExercise.details.push({ sets, reps, weight, volume });
      return;
    }

    const exerciseNameMatch = trimmedLine.match(/^[A-Za-zÀ-ÿ0-9\s.]+$/);
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

