import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import type { Aluno } from "@/types/aluno";
import type { WorkoutWithDetails } from "@/services/apiWorkouts";
import { toast } from "@/hooks/use-toast";

interface StudentMonthlyReportProps {
  student: Aluno;
  workouts: WorkoutWithDetails[];
}

export default function StudentMonthlyReport({ student, workouts }: StudentMonthlyReportProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentYearMonth = `${currentYear}-${currentMonth}`;

  const { totalCount, totalVolume, averageVolume } = useMemo(() => {
    const monthWorkouts = workouts.filter(w => (w.data_treino || "").startsWith(currentYearMonth));
    const count = monthWorkouts.length;
    const volumeTotal = Math.round(monthWorkouts.reduce((sum, w) => sum + (w.volume_total || 0), 0));
    const avg = count > 0 ? Math.round(volumeTotal / count) : 0;
    return { totalCount: count, totalVolume: volumeTotal, averageVolume: avg };
  }, [workouts, currentYearMonth]);

  const handleCopyWhatsapp = () => {
    const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const text = [
      `📊 Relatório Mensal • ${student.nome} (${monthLabel})`,
      `🧰 Treinos: ${totalCount}`,
      `🏋️ Volume Total: ${totalVolume.toLocaleString()} kg`,
      `📈 Média por treino: ${averageVolume.toLocaleString()} kg`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Relatório copiado", description: "Conteúdo pronto para enviar no WhatsApp." });
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Relatório Mensal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Relatório Mensal</DialogTitle>
          <DialogDescription>
            Resumo do mês atual para envio ao aluno.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          <div className="p-4 rounded-lg bg-secondary/20 text-center">
            <div className="text-sm text-muted-foreground">Treinos no mês</div>
            <div className="text-2xl font-bold">{totalCount}</div>
          </div>
          <div className="p-4 rounded-lg bg-secondary/20 text-center">
            <div className="text-sm text-muted-foreground">Volume total</div>
            <div className="text-2xl font-bold text-primary">{totalVolume.toLocaleString()} kg</div>
          </div>
          <div className="p-4 rounded-lg bg-secondary/20 text-center">
            <div className="text-sm text-muted-foreground">Média por treino</div>
            <div className="text-2xl font-bold">{averageVolume.toLocaleString()} kg</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleCopyWhatsapp}>Copiar para WhatsApp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

