import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWallets, useCategories, addTransaction, formatRupiah } from "@/lib/firestore";
import PageTransition from "@/components/PageTransition";

const defaultCategories = {
  income: ["Gaji", "Freelance", "Bonus", "Lainnya"],
  expense: ["Makanan", "Belanja", "Transportasi", "Utilitas", "Kesehatan", "Hiburan", "Pendidikan", "Rumah Tangga", "Lainnya"],
  transfer: ["Transfer"],
};

const AddTransaction = () => {
  const navigate = useNavigate();
  const { user, householdId } = useAuth();
  const { wallets } = useWallets(householdId);
  const { categories: customCategories } = useCategories(householdId);
  
  const [type, setType] = useState<"income" | "expense" | "transfer">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [walletId, setWalletId] = useState("");
  const [walletToId, setWalletToId] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const typeLabels = { income: "Pemasukan", expense: "Pengeluaran", transfer: "Transfer" };

  const handleSave = async () => {
    if (!householdId || !user) return;
    if (!amount || !description || !walletId || !category) {
      toast({ title: "Mohon lengkapi semua field", variant: "destructive" });
      return;
    }
    if (type === "transfer" && !walletToId) {
      toast({ title: "Pilih dompet tujuan", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const txData: any = {
        date,
        description,
        amount: Number(amount),
        type,
        category,
        walletId,
        memberId: user.uid,
        note,
      };
      if (type === "transfer" && walletToId) {
        txData.walletToId = walletToId;
      }
      await addTransaction(householdId, txData);
      toast({ title: "Transaksi ditambahkan! ✅" });
      navigate("/transactions");
    } catch (err: any) {
      toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <h1 className="text-lg font-bold">Tambah Transaksi</h1>
        <div className="flex gap-2">
          {(["income", "expense", "transfer"] as const).map((t) => (
            <Button key={t} variant={type === t ? "default" : "outline"} size="sm" className="flex-1" onClick={() => { setType(t); setCategory(""); }}>
              {typeLabels[t]}
            </Button>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <Label>Jumlah (Rp)</Label>
              <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-2xl font-bold h-14 text-center" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input placeholder="cth: Belanja Supermarket" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{type === "transfer" ? "Dari Dompet" : "Dompet"}</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger><SelectValue placeholder="Pilih dompet" /></SelectTrigger>
                <SelectContent>{wallets.map((w) => <SelectItem key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {type === "transfer" && (
              <div className="space-y-2">
                <Label>Ke Dompet</Label>
                <Select value={walletToId} onValueChange={setWalletToId}>
                  <SelectTrigger><SelectValue placeholder="Pilih tujuan" /></SelectTrigger>
                  <SelectContent>{wallets.filter((w) => w.id !== walletId).map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{(() => {
                  const customNames = customCategories.filter(c => c.type === type || (type === "transfer")).map(c => c.name);
                  const merged = [...new Set([...defaultCategories[type], ...customNames])];
                  return merged.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>);
                })()}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea placeholder="Catatan tambahan..." rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button className="w-full font-semibold" size="lg" onClick={handleSave} disabled={saving}>
              {saving ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : "Simpan Transaksi"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default AddTransaction;
