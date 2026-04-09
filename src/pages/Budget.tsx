import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertTriangle, Pencil, Trash2, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets, addBudget, updateBudget, deleteBudget, useCategories, addCategory, updateCategory, deleteCategory, formatRupiah } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const defaultExpenseCategories = ["Makanan", "Belanja", "Transportasi", "Utilitas", "Kesehatan", "Hiburan", "Pendidikan", "Rumah Tangga", "Lainnya"];

const Budget = () => {
  const { householdId } = useAuth();
  const { budgets, loading } = useBudgets(householdId);
  const { categories } = useCategories(householdId);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit budget state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLimit, setEditLimit] = useState("");

  // Category CRUD state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

  // Merge default + custom categories
  const expenseCategories = categories.filter(c => c.type === "expense");
  const customCatNames = expenseCategories.map(c => c.name);
  const allCategoryNames = [...new Set([...defaultExpenseCategories, ...customCatNames])];

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const handleAdd = async () => {
    if (!householdId || !selectedCategory || !limit) return;
    setSaving(true);
    try {
      await addBudget(householdId, { category: selectedCategory, limit: Number(limit) });
      toast({ title: "Anggaran ditambahkan! ✅" });
      setSelectedCategory("");
      setLimit("");
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openEditBudget = (b: any) => {
    setEditId(b.id);
    setEditCategory(b.category);
    setEditLimit(String(b.limit));
    setEditDialogOpen(true);
  };

  const handleEditBudget = async () => {
    if (!householdId || !editId) return;
    setSaving(true);
    try {
      await updateBudget(householdId, editId, { category: editCategory, limit: Number(editLimit) });
      toast({ title: "Anggaran diperbarui! ✅" });
      setEditDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string, name: string) => {
    if (!householdId) return;
    if (!confirm(`Hapus anggaran "${name}"?`)) return;
    try {
      await deleteBudget(householdId, budgetId);
      toast({ title: "Anggaran dihapus" });
    } catch (err: any) {
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
    }
  };

  // Category CRUD handlers
  const handleAddCategory = async () => {
    if (!householdId || !newCatName.trim()) return;
    try {
      await addCategory(householdId, { name: newCatName.trim(), type: "expense" });
      toast({ title: "Kategori ditambahkan! ✅" });
      setNewCatName("");
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const handleEditCategory = async (catId: string) => {
    if (!householdId || !editCatName.trim()) return;
    try {
      await updateCategory(householdId, catId, { name: editCatName.trim(), type: "expense" });
      toast({ title: "Kategori diperbarui! ✅" });
      setEditCatId(null);
      setEditCatName("");
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!householdId) return;
    if (!confirm(`Hapus kategori "${catName}"?`)) return;
    try {
      await deleteCategory(householdId, catId);
      toast({ title: "Kategori dihapus" });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Anggaran</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setCatDialogOpen(true)}>
              <Settings2 className="w-4 h-4" /> Kategori
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Tambah</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Anggaran</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        {allCategoryNames.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Limit Bulanan (Rp)</Label><Input type="number" placeholder="0" value={limit} onChange={(e) => setLimit(e.target.value)} /></div>
                  <Button className="w-full" onClick={handleAdd} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {budgets.length > 0 && (
          <Card className="border-0 shadow-md bg-primary text-primary-foreground">
            <CardContent className="py-4">
              <p className="text-xs opacity-80">Total Anggaran Bulan Ini</p>
              <p className="text-2xl font-extrabold">{formatRupiah(totalSpent)} <span className="text-sm font-normal opacity-70">/ {formatRupiah(totalLimit)}</span></p>
              <Progress value={totalPct} className="h-2 mt-3 bg-primary-foreground/20" />
            </CardContent>
          </Card>
        )}

        {loading && <p className="text-sm text-muted-foreground text-center py-8">Memuat...</p>}
        {!loading && budgets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada anggaran. Tambahkan yang pertama!</p>
        )}

        <div className="space-y-3">
          {budgets.map((b) => {
            const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
            const isWarning = pct >= 80 && pct < 100;
            const isDanger = pct >= 100;
            return (
              <Card key={b.id} className="border-0 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{b.category}</span>
                      {isDanger && <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="w-3 h-3" /> Melebihi</Badge>}
                      {isWarning && !isDanger && <Badge className="text-[10px] gap-1 bg-warning text-warning-foreground"><AlertTriangle className="w-3 h-3" /> Hampir Habis</Badge>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold mr-1">{pct}%</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBudget(b)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteBudget(b.id, b.category)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={Math.min(pct, 100)} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Terpakai: {formatRupiah(b.spent)}</span>
                    <span>Limit: {formatRupiah(b.limit)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Budget Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Anggaran</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allCategoryNames.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Limit Bulanan (Rp)</Label><Input type="number" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} /></div>
              <Button className="w-full" onClick={handleEditBudget} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category CRUD Dialog */}
        <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Kelola Kategori</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Input placeholder="Nama kategori baru" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                <Button onClick={handleAddCategory} disabled={!newCatName.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">Kategori Default:</div>
              <div className="flex flex-wrap gap-1.5">
                {defaultExpenseCategories.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>

              {expenseCategories.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground">Kategori Kustom:</div>
                  <div className="space-y-2">
                    {expenseCategories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        {editCatId === cat.id ? (
                          <>
                            <Input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="flex-1 h-8" />
                            <Button size="sm" variant="outline" onClick={() => handleEditCategory(cat.id)}>Simpan</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditCatId(null)}>Batal</Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">{cat.name}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name); }}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(cat.id, cat.name)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Budget;
