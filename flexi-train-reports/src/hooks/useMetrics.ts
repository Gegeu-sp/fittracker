import { useQuery } from "@tanstack/react-query";
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval } from "date-fns";
import { getAlunos } from "@/services/apiAlunos";
import { getWorkouts } from "@/services/apiWorkouts";
import type { WorkoutWithDetails } from "@/services/apiWorkouts";

export interface Metrics {
  totalStudents: number;
  activeStudents: number;
  weeklyWorkouts: number;
  monthlyGrowth: number;
  totalVolume: number;
  totalVolumeThisWeek: number;
  totalExercises: number;
  avgWorkoutDuration: number;
  loading: boolean;
}

export const useMetrics = (): Metrics => {
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: getAlunos,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workouts = [], isLoading: loadingWorkouts } = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const loading = loadingStudents || loadingWorkouts;

  const calculateStats = () => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });

    // 1. Active Students
    const totalStudents = students.length;
    const activeStudents = students.filter(student => student.status === 'ativo').length;

    // 2. Workouts This Week
    const workoutsThisWeek = workouts.filter(workout => {
      const [yy, mm, dd] = workout.data_treino.split('-');
      const localDate = new Date(Number(yy), Number(mm) - 1, Number(dd));
      return isWithinInterval(localDate, { start: currentWeekStart, end: currentWeekEnd });
    });
    const weeklyWorkoutsCount = workoutsThisWeek.length;

    // Workouts Last Week (for comparison)
    const workoutsLastWeek = workouts.filter(workout => {
      const [yy, mm, dd] = workout.data_treino.split('-');
      const localDate = new Date(Number(yy), Number(mm) - 1, Number(dd));
      return isWithinInterval(localDate, { start: lastWeekStart, end: lastWeekEnd });
    });
    const monthlyGrowth = workoutsLastWeek.length > 0 
      ? ((weeklyWorkoutsCount - workoutsLastWeek.length) / workoutsLastWeek.length) * 100 
      : 0;

    // 3. Volume Logic
    const totalVolumeThisWeek = workoutsThisWeek.reduce((sum, w) => sum + (w.volume_total || 0), 0);
    const totalVolume = workouts.reduce((sum, workout) => sum + (workout.volume_total || 0), 0);
    const totalExercises = workouts.reduce((sum, workout) => sum + (workout.total_exercicios || 0), 0);
    
    // Average workout duration (simulated)
    const avgWorkoutDuration = workouts.length > 0 ? 65 : 0;

    return {
      totalStudents,
      activeStudents,
      weeklyWorkouts: weeklyWorkoutsCount,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      totalVolume: Math.round(totalVolume),
      totalVolumeThisWeek: Math.round(totalVolumeThisWeek),
      totalExercises,
      avgWorkoutDuration
    };
  };

  const stats = calculateStats();

  return { ...stats, loading };
};

export function getStudentTotalLifetimeVolume(workouts: WorkoutWithDetails[]): number {
  return Math.round(workouts.reduce((sum, w) => sum + (w.volume_total || 0), 0));
}
