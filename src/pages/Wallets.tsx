import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Banknote, Building2, Smartphone, TrendingUp, TrendingDown, ArrowLeftRight, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallets, useTransactions, addWallet, updateWallet, deleteWallet, formatRupiah } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const walletTypeIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-5 h-5" />,
  bank: <Building2 className="w-5 h-5" />,
  ewallet: <Smartphone className="w-5 h-5" />,
};

const walletTypeColors: Record<string, string> = {
  cash: "hsl(152 60% 42%)",
  bank: "hsl(217 70% 50%)",
  ewallet: "hsl(187 70% 42%)",
};

const Wallets = () => {
  const { householdId } = useAuth();
  const { wallets, loading } = useWallets(householdId);
  const { transactions } = useTransactions(householdId);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [balance, setBalance] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editBalance, setEditBalance] = useState("");

  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);

  const handleAdd = async () => {
    if (!householdId || !name || !type) return;
    setSaving(true);
    try {
      await addWallet(householdId, { name, type, balance: Number(balance) || 0 });
      toast({ title: "Dompet ditambahkan! ✅" });
      setName(""); setType(""); setBalance("");
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (w: any) => {
    setEditId(w.id);
    setEditName(w.name);
    setEditType(w.type);
    setEditBalance(String(w.balance || 0));
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!householdId || !editId) return;
    setSaving(true);
    try {
      await updateWallet(householdId, editId, {
        name: editName,
        type: editType as any,
        balance: Number(editBalance) || 0,
      });
      toast({ title: "Dompet diperbarui! ✅" });
      setEditDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (walletId: string, walletName: string) => {
    if (!householdId) return;
    if (!confirm(`Hapus dompet "${walletName}"?`)) return;
    try {
      await deleteWallet(householdId, walletId);
      toast({ title: "Dompet dihapus" });
    } catch (err: any) {
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
    }
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Dompet</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Tambah</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Dompet Baru</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Nama Dompet</Label><Input placeholder="cth: Mandiri" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Saldo Awal</Label><Input type="number" placeholder="0" value={balance} onChange={(e) => setBalance(e.target.value)} /></div>
                <Button className="w-full" onClick={handleAdd} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-md bg-primary text-primary-foreground">
          <CardContent className="py-4">
            <p className="text-xs opacity-80">Total Saldo Semua Dompet</p>
            <p className="text-2xl font-extrabold">{formatRupiah(totalBalance)}</p>
          </CardContent>
        </Card>

        {loading && <p className="text-sm text-muted-foreground text-center py-8">Memuat...</p>}
        {!loading && wallets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada dompet. Tambahkan yang pertama!</p>
        )}

        <div className="space-y-3">
          {wallets.map((w) => {
            const color = walletTypeColors[w.type] || walletTypeColors.cash;
            const wTx = transactions.filter((t) => t.walletId === w.id).slice(0, 3);
            return (
              <Card key={w.id} className="border-0 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20", color }}>
                      {walletTypeIcons[w.type] || walletTypeIcons.cash}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{w.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{w.type === "ewallet" ? "E-Wallet" : w.type}</p>
                    </div>
                    <p className="text-base font-bold">{formatRupiah(w.balance)}</p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(w)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(w.id, w.name)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {wTx.length > 0 && (
                    <div className="border-t pt-2 space-y-2">
                      {wTx.map((tx) => (
                        <div key={tx.id} className="flex items-center gap-2 text-xs">
                          {tx.type === "income" ? <TrendingUp className="w-3 h-3 text-success" /> : tx.type === "expense" ? <TrendingDown className="w-3 h-3 text-destructive" /> : <ArrowLeftRight className="w-3 h-3 text-primary" />}
                          <span className="flex-1 truncate text-muted-foreground">{tx.description}</span>
                          <span className={tx.type === "income" ? "text-success font-medium" : tx.type === "expense" ? "text-destructive font-medium" : "font-medium"}>
                            {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatRupiah(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Dompet</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Nama Dompet</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Saldo</Label><Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} /></div>
              <Button className="w-full" onClick={handleEdit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Wallets;
