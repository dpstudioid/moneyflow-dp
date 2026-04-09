import { Card, CardContent } from "@/components/ui/card";
import { monthlySummary, formatRupiah } from "@/lib/dummy-data";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const Reports = () => {
  const current = monthlySummary[monthlySummary.length - 1];
  const netData = monthlySummary.map((m) => ({ ...m, net: m.income - m.expense }));

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <h1 className="text-lg font-bold">Laporan Bulanan</h1>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-3 text-center">
              <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-[11px] text-muted-foreground">Pemasukan</p>
              <p className="text-sm font-bold text-success">{formatRupiah(current.income)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="py-3 text-center">
              <TrendingDown className="w-5 h-5 text-destructive mx-auto mb-1" />
              <p className="text-[11px] text-muted-foreground">Pengeluaran</p>
              <p className="text-sm font-bold text-destructive">{formatRupiah(current.expense)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="py-3 text-center">
            <ArrowLeftRight className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[11px] text-muted-foreground">Selisih (Net)</p>
            <p className="text-lg font-extrabold text-success">{formatRupiah(current.income - current.expense)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-2">
            <h2 className="text-sm font-semibold mb-3">Perbandingan Bulanan</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlySummary} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip formatter={(val: number) => formatRupiah(val)} contentStyle={{ borderRadius: 8, border: "none", fontSize: 12 }} />
                <Bar dataKey="income" fill="hsl(152 60% 42%)" radius={[4, 4, 0, 0]} name="Pemasukan" />
                <Bar dataKey="expense" fill="hsl(0 72% 55%)" radius={[4, 4, 0, 0]} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-2">
            <h2 className="text-sm font-semibold mb-3">Tren Net (Pemasukan − Pengeluaran)</h2>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={netData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip formatter={(val: number) => formatRupiah(val)} contentStyle={{ borderRadius: 8, border: "none", fontSize: 12 }} />
                <Line type="monotone" dataKey="net" stroke="hsl(187 70% 42%)" strokeWidth={2} dot={{ r: 4 }} name="Net" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-2">
            <h2 className="text-sm font-semibold mb-3">Rincian per Bulan</h2>
            <div className="space-y-2">
              {[...monthlySummary].reverse().map((m) => (
                <div key={m.month} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                  <span className="font-medium">{m.month} 2026</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-success">+{formatRupiah(m.income)}</span>
                    <span className="text-destructive">-{formatRupiah(m.expense)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Reports;
