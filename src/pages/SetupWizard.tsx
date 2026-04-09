import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Wallet, Building2, Smartphone, Banknote, PiggyBank, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const BANKS = [
  { id: "bca", name: "BCA", icon: "🏦" },
  { id: "bni", name: "BNI", icon: "🏦" },
  { id: "bri", name: "BRI", icon: "🏦" },
  { id: "mandiri", name: "Mandiri", icon: "🏦" },
  { id: "cimb", name: "CIMB Niaga", icon: "🏦" },
  { id: "danamon", name: "Danamon", icon: "🏦" },
  { id: "bsi", name: "BSI", icon: "🏦" },
  { id: "permata", name: "Permata", icon: "🏦" },
];

const EWALLETS = [
  { id: "gopay", name: "GoPay", icon: "💚" },
  { id: "ovo", name: "OVO", icon: "💜" },
  { id: "dana", name: "DANA", icon: "💙" },
  { id: "shopeepay", name: "ShopeePay", icon: "🧡" },
  { id: "linkaja", name: "LinkAja", icon: "❤️" },
  { id: "jenius", name: "Jenius", icon: "💛" },
];

const BUDGET_CATEGORIES = [
  { id: "makanan", name: "Makanan", icon: "🍽️" },
  { id: "transportasi", name: "Transportasi", icon: "🚗" },
  { id: "belanja", name: "Belanja", icon: "🛒" },
  { id: "hiburan", name: "Hiburan", icon: "🎮" },
  { id: "utilitas", name: "Utilitas", icon: "⚡" },
  { id: "kesehatan", name: "Kesehatan", icon: "💊" },
  { id: "pendidikan", name: "Pendidikan", icon: "📚" },
  { id: "rumah_tangga", name: "Rumah Tangga", icon: "🏠" },
];

interface WalletEntry {
  name: string;
  type: "cash" | "bank" | "ewallet";
  balance: string;
}

interface BudgetEntry {
  category: string;
  limit: string;
}

const SetupWizard = () => {
  const navigate = useNavigate();
  const { user, refreshSetupStatus } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const totalSteps = 5;

  // Step 1: Household name
  const [householdName, setHouseholdName] = useState("");

  // Step 2: Cash
  const [cashBalance, setCashBalance] = useState("");

  // Step 3: Banks
  const [selectedBanks, setSelectedBanks] = useState<Record<string, boolean>>({});
  const [bankBalances, setBankBalances] = useState<Record<string, string>>({});

  // Step 4: E-wallets
  const [selectedEwallets, setSelectedEwallets] = useState<Record<string, boolean>>({});
  const [ewalletBalances, setEwalletBalances] = useState<Record<string, string>>({});

  // Step 5: Budgets
  const [budgetEntries, setBudgetEntries] = useState<Record<string, string>>({});

  const toggleBank = (id: string) => {
    setSelectedBanks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEwallet = (id: string) => {
    setSelectedEwallets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Create household
      const householdRef = await addDoc(collection(db, "households"), {
        name: householdName || "Rumah Tangga Saya",
        ownerId: user.uid,
        members: [user.uid],
        createdAt: new Date(),
      });

      // Build wallets
      const walletsList: WalletEntry[] = [];

      // Cash
      if (cashBalance && Number(cashBalance) > 0) {
        walletsList.push({ name: "Cash", type: "cash", balance: cashBalance });
      }

      // Banks
      BANKS.forEach((bank) => {
        if (selectedBanks[bank.id] && bankBalances[bank.id]) {
          walletsList.push({ name: bank.name, type: "bank", balance: bankBalances[bank.id] });
        }
      });

      // E-wallets
      EWALLETS.forEach((ew) => {
        if (selectedEwallets[ew.id] && ewalletBalances[ew.id]) {
          walletsList.push({ name: ew.name, type: "ewallet", balance: ewalletBalances[ew.id] });
        }
      });

      // Save wallets
      for (const w of walletsList) {
        await addDoc(collection(db, "households", householdRef.id, "wallets"), {
          name: w.name,
          type: w.type,
          balance: Number(w.balance) || 0,
          createdAt: new Date(),
        });
      }

      // Save budgets
      for (const cat of BUDGET_CATEGORIES) {
        const limit = budgetEntries[cat.id];
        if (limit && Number(limit) > 0) {
          await addDoc(collection(db, "households", householdRef.id, "budgets"), {
            category: cat.name,
            limit: Number(limit),
            spent: 0,
            icon: cat.icon,
            createdAt: new Date(),
          });
        }
      }

      // Add owner as member
      await addDoc(collection(db, "households", householdRef.id, "members"), {
        email: user.email,
        displayName: user.displayName || householdName,
        role: "owner",
        status: "active",
        joinedAt: new Date(),
      });

      // Update user doc
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName || householdName,
        householdId: householdRef.id,
        setupComplete: true,
        role: "owner",
        createdAt: new Date(),
      });

      await refreshSetupStatus();
      toast({ title: "Setup selesai! 🎉", description: "Selamat datang di MoneyFlow" });
      navigate("/");
    } catch (err: any) {
      console.error("Setup error:", err);
      toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 1) return householdName.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Langkah {step} dari {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step 1: Household */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground">
                <Wallet className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold">Selamat Datang! 👋</h1>
              <p className="text-muted-foreground text-sm">Mari siapkan keuangan rumah tangga kamu</p>
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-2">
                  <Label>Nama Rumah Tangga</Label>
                  <Input
                    placeholder="cth: Keluarga Pratama"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Cash */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success text-success-foreground">
                <Banknote className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold">Uang Cash</h1>
              <p className="text-muted-foreground text-sm">Berapa uang tunai yang kamu miliki?</p>
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-2">
                  <Label>Saldo Cash (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={cashBalance}
                    onChange={(e) => setCashBalance(e.target.value)}
                    className="text-xl font-bold h-14 text-center"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">Bisa diubah nanti di pengaturan</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Banks */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground">
                <Building2 className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold">Rekening Bank</h1>
              <p className="text-muted-foreground text-sm">Pilih bank yang kamu gunakan</p>
            </div>
            <Card className="border-0 shadow-lg max-h-[50vh] overflow-y-auto">
              <CardContent className="pt-5 space-y-3">
                {BANKS.map((bank) => (
                  <div key={bank.id} className="space-y-2">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedBanks[bank.id]
                          ? "border-primary bg-accent"
                          : "border-transparent bg-secondary hover:bg-secondary/80"
                      }`}
                      onClick={() => toggleBank(bank.id)}
                    >
                      <Checkbox checked={!!selectedBanks[bank.id]} />
                      <span className="text-lg">{bank.icon}</span>
                      <span className="font-medium text-sm flex-1">{bank.name}</span>
                    </div>
                    {selectedBanks[bank.id] && (
                      <Input
                        type="number"
                        placeholder="Saldo (Rp)"
                        value={bankBalances[bank.id] || ""}
                        onChange={(e) => setBankBalances((prev) => ({ ...prev, [bank.id]: e.target.value }))}
                        className="ml-10"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: E-Wallets */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-warning text-warning-foreground">
                <Smartphone className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold">E-Wallet</h1>
              <p className="text-muted-foreground text-sm">Pilih e-wallet yang kamu gunakan</p>
            </div>
            <Card className="border-0 shadow-lg max-h-[50vh] overflow-y-auto">
              <CardContent className="pt-5 space-y-3">
                {EWALLETS.map((ew) => (
                  <div key={ew.id} className="space-y-2">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedEwallets[ew.id]
                          ? "border-primary bg-accent"
                          : "border-transparent bg-secondary hover:bg-secondary/80"
                      }`}
                      onClick={() => toggleEwallet(ew.id)}
                    >
                      <Checkbox checked={!!selectedEwallets[ew.id]} />
                      <span className="text-lg">{ew.icon}</span>
                      <span className="font-medium text-sm flex-1">{ew.name}</span>
                    </div>
                    {selectedEwallets[ew.id] && (
                      <Input
                        type="number"
                        placeholder="Saldo (Rp)"
                        value={ewalletBalances[ew.id] || ""}
                        onChange={(e) => setEwalletBalances((prev) => ({ ...prev, [ew.id]: e.target.value }))}
                        className="ml-10"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Budget */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground">
                <PiggyBank className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold">Anggaran Bulanan</h1>
              <p className="text-muted-foreground text-sm">Tetapkan limit per kategori (opsional)</p>
            </div>
            <Card className="border-0 shadow-lg max-h-[50vh] overflow-y-auto">
              <CardContent className="pt-5 space-y-3">
                {BUDGET_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-lg w-8 text-center">{cat.icon}</span>
                    <span className="font-medium text-sm w-28">{cat.name}</span>
                    <Input
                      type="number"
                      placeholder="Rp 0"
                      value={budgetEntries[cat.id] || ""}
                      onChange={(e) => setBudgetEntries((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-2">Semua bisa diubah nanti</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep((s) => (s - 1) as any)}>
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          )}
          {step < totalSteps ? (
            <Button className="flex-1 gap-2 font-semibold" onClick={() => setStep((s) => (s + 1) as any)} disabled={!canNext()}>
              Lanjut <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="flex-1 gap-2 font-semibold" onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {saving ? "Menyimpan..." : "Selesai"}
            </Button>
          )}
        </div>

        {/* Skip */}
        {step > 1 && step < totalSteps && (
          <button
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setStep((s) => (s + 1) as any)}
          >
            Lewati langkah ini
          </button>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
