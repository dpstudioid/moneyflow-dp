import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions, useWallets, useMembers, formatRupiah } from "@/lib/firestore";
import PageTransition from "@/components/PageTransition";

const Transactions = () => {
  const { householdId } = useAuth();
  const { transactions, loading } = useTransactions(householdId);
  const { wallets } = useWallets(householdId);
  const { members } = useMembers(householdId);
  const [filterType, setFilterType] = useState("all");

  const filtered = filterType === "all" ? transactions : transactions.filter((t) => t.type === filterType);

  const grouped = filtered.reduce<Record<string, typeof transactions>>((acc, tx) => {
    (acc[tx.date] = acc[tx.date] || []).push(tx);
    return acc;
  }, {});

  const txIcon = (type: string) => {
    if (type === "income") return <TrendingUp className="w-4 h-4 text-success" />;
    if (type === "expense") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <ArrowLeftRight className="w-4 h-4 text-primary" />;
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <h1 className="text-lg font-bold">Transaksi</h1>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && <p className="text-sm text-muted-foreground text-center py-8">Memuat...</p>}
        {!loading && transactions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada transaksi. Tambahkan yang pertama!</p>
        )}

        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="text-xs text-muted-foreground font-medium mb-2">
              {new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <Card className="border-0 shadow-sm">
              <CardContent className="py-2 divide-y">
                {txs.map((tx) => {
                  const wallet = wallets.find((w) => w.id === tx.walletId);
                  const member = members.find((m) => m.id === tx.memberId);
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">{txIcon(tx.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span>{tx.category}</span>
                          {wallet && <><span>·</span><span>{wallet.name}</span></>}
                          {member && <><span>·</span><span>{member.displayName?.split(" ")[0]}</span></>}
                        </div>
                      </div>
                      <p className={`text-sm font-bold whitespace-nowrap ${tx.type === "income" ? "text-success" : tx.type === "expense" ? "text-destructive" : "text-foreground"}`}>
                        {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatRupiah(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </PageTransition>
  );
};

export default Transactions;
