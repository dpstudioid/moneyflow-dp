import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Bell, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useWallets, useBudgets, useTransactions, useMembers, useNotifications, useHousehold, formatRupiah } from "@/lib/firestore";
import { healthScore, monthlySummary } from "@/lib/dummy-data";
import PageTransition from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, householdId } = useAuth();
  const { household } = useHousehold(householdId);
  const { wallets, loading: wLoading } = useWallets(householdId);
  const { budgets } = useBudgets(householdId);
  const { transactions } = useTransactions(householdId);
  const { members } = useMembers(householdId);
  const { notifications } = useNotifications(householdId);

  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);
  const unread = notifications.filter((n) => !n.read).length;
  const recentTx = transactions.slice(0, 5);
  const displayName = user?.displayName?.split(" ")[0] || "User";

  const txIcon = (type: string) => {
    if (type === "income") return <TrendingUp className="w-4 h-4 text-success" />;
    if (type === "expense") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <ArrowLeftRight className="w-4 h-4 text-primary" />;
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Halo, {displayName} 👋</p>
            <h1 className="text-lg font-bold">{household?.name || "MoneyFlow"}</h1>
          </div>
          <button onClick={() => navigate("/notifications")} className="relative p-2">
            <Bell className="w-5 h-5 text-foreground" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">{unread}</span>
            )}
          </button>
        </div>

        {/* Balance Card */}
        <Card className="border-0 shadow-md bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs opacity-80">Total Saldo</p>
                {wLoading ? <Skeleton className="h-8 w-40 bg-primary-foreground/20" /> : (
                  <p className="text-2xl font-extrabold tracking-tight">{formatRupiah(totalBalance)}</p>
                )}
              </div>
              <div className="text-center cursor-pointer" onClick={() => navigate("/health")}>
                <div className="w-14 h-14 rounded-full border-4 border-primary-foreground/30 flex items-center justify-center">
                  <span className="text-lg font-extrabold">{healthScore.overall}</span>
                </div>
                <p className="text-[10px] opacity-80 mt-1">Health</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {wallets.map((w) => (
                <button key={w.id} onClick={() => navigate("/wallets")} className="flex-shrink-0 bg-primary-foreground/15 rounded-full px-3 py-1.5 text-xs font-medium">
                  {w.name}: {formatRupiah(w.balance)}
                </button>
              ))}
              {wallets.length === 0 && !wLoading && (
                <p className="text-xs opacity-60">Belum ada dompet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Ringkasan Bulanan</h2>
              <button onClick={() => navigate("/reports")} className="text-xs text-primary font-medium">Lihat Semua</button>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthlySummary} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip formatter={(val: number) => formatRupiah(val)} contentStyle={{ borderRadius: 8, border: "none", fontSize: 12 }} />
                <Bar dataKey="income" fill="hsl(152 60% 42%)" radius={[4, 4, 0, 0]} name="Pemasukan" />
                <Bar dataKey="expense" fill="hsl(0 72% 55%)" radius={[4, 4, 0, 0]} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Pemasukan</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Pengeluaran</span>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        {members.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-semibold mb-3">Anggota</h2>
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                        {m.displayName?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1"><p className="text-sm font-medium">{m.displayName}</p></div>
                    <span className="text-xs text-muted-foreground capitalize">{m.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Status */}
        {budgets.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Status Anggaran</h2>
                <button onClick={() => navigate("/budget")} className="text-xs text-primary font-medium">Lihat Semua</button>
              </div>
              <div className="space-y-3">
                {budgets.slice(0, 3).map((b) => {
                  const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{b.category}</span>
                        <span className={pct >= 90 ? "text-destructive font-semibold" : pct >= 80 ? "text-warning font-semibold" : "text-muted-foreground"}>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Aktivitas Terbaru</h2>
              <button onClick={() => navigate("/transactions")} className="text-xs text-primary font-medium">Lihat Semua</button>
            </div>
            {recentTx.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada transaksi</p>
            ) : (
              <div className="space-y-3">
                {recentTx.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">{txIcon(tx.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-[11px] text-muted-foreground">{tx.category}</p>
                    </div>
                    <p className={`text-sm font-bold ${tx.type === "income" ? "text-success" : tx.type === "expense" ? "text-destructive" : "text-foreground"}`}>
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatRupiah(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
