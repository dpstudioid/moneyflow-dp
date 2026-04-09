import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { healthScore, healthHistory } from "@/lib/dummy-data";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { HeartPulse, PiggyBank, ShieldCheck, TrendingUp, Activity } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const metrics = [
  { key: "savingRate" as const, label: "Saving Rate", icon: PiggyBank, desc: "Persentase pendapatan yang ditabung" },
  { key: "emergencyFund" as const, label: "Emergency Fund", icon: ShieldCheck, desc: "Cadangan dana darurat vs pengeluaran" },
  { key: "debtRatio" as const, label: "Debt Ratio", icon: TrendingUp, desc: "Rasio utang terhadap pendapatan" },
  { key: "stability" as const, label: "Stability", icon: Activity, desc: "Konsistensi pengelolaan keuangan" },
];

const HealthScore = () => {
  const getColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <h1 className="text-lg font-bold">Financial Health</h1>
        <Card className="border-0 shadow-md bg-primary text-primary-foreground">
          <CardContent className="py-6 text-center">
            <HeartPulse className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-5xl font-extrabold">{healthScore.overall}</p>
            <p className="text-sm opacity-80 mt-1">Skor Kesehatan Keuangan</p>
            <div className="w-48 mx-auto mt-3"><Progress value={healthScore.overall} className="h-2 bg-primary-foreground/20" /></div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {metrics.map((m) => {
            const val = healthScore[m.key];
            return (
              <Card key={m.key} className="border-0 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><m.icon className="w-4 h-4 text-accent-foreground" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                    </div>
                    <span className={`text-lg font-extrabold ${getColor(val)}`}>{val}</span>
                  </div>
                  <Progress value={val} className="h-1.5" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-2">
            <h2 className="text-sm font-semibold mb-3">Histori Skor</h2>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={healthHistory}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(187 70% 42%)" strokeWidth={2} dot={{ r: 4 }} name="Skor" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default HealthScore;
