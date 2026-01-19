import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseWorkoutTextModel } from "@/lib/workoutParserModel";

type TestCase = { name: string; input: string; expected: { totalSets: number; totalReps: number; totalVolume: number; exercises: number } };

const cases: TestCase[] = [
  {
    name: "Exemplo básico",
    input: `Agachamento livre\n1x12x40kg\n1x10x50kg\n\nSupino inclinado\n3x12x20kg`,
    expected: { totalSets: 5, totalReps: 58, totalVolume: 1700, exercises: 2 }
  },
  {
    name: "Unilateral 10/10",
    input: `Cadeira extensora\n3x10/10x20kg`,
    expected: { totalSets: 3, totalReps: 60, totalVolume: 1200, exercises: 1 }
  },
  {
    name: "Peso decimal vírgula",
    input: `Rosca direta\n4x12x7,5kg`,
    expected: { totalSets: 4, totalReps: 48, totalVolume: 360, exercises: 1 }
  }
];

export default function ParserEquivalenceTester() {
  const [results, setResults] = useState<{ name: string; pass: boolean; got: string; expected: string }[]>([]);

  const run = () => {
    const r = cases.map(tc => {
      const parsed = parseWorkoutTextModel(tc.input);
      const got = JSON.stringify({
        totalSets: parsed.totalSets,
        totalReps: parsed.totalReps,
        totalVolume: Math.round(parsed.totalVolume),
        exercises: parsed.exercises.length
      });
      const expected = JSON.stringify(tc.expected);
      return { name: tc.name, pass: got === expected, got, expected };
    });
    setResults(r);
  };

  const allPass = useMemo(() => results.length > 0 && results.every(r => r.pass), [results]);

  return (
    <div className="min-h-screen bg-subtle-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="card-fitness">
          <CardHeader>
            <CardTitle>Testes Comparativos do Parser (Modelo)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="btn-fitness" onClick={run}>Executar Testes</Button>
            <div className="mt-4 space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border ${r.pass ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                  <div className="font-medium">{r.name}: {r.pass ? 'OK' : 'FALHA'}</div>
                  {!r.pass && (
                    <div className="text-xs text-muted-foreground">Esperado {r.expected} | Obtido {r.got}</div>
                  )}
                </div>
              ))}
              {results.length > 0 && (
                <div className={`p-3 rounded-lg ${allPass ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{allPass ? 'Todos os testes passaram' : 'Há falhas'}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
