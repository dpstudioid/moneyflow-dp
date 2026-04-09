// ============================================================
// MoneyFlow — Data Dummy (Bahasa Indonesia, Rupiah)
// ============================================================

export type MemberRole = "owner" | "member";

export interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet";
  balance: number;
  icon: string;
  color: string;
}

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  walletId: string;
  walletToId?: string;
  memberId: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "warning" | "info" | "success";
}

export interface AuditEntry {
  id: string;
  entity: string;
  action: string;
  before: string;
  after: string;
  memberId: string;
  date: string;
}

export interface HealthScore {
  overall: number;
  savingRate: number;
  emergencyFund: number;
  debtRatio: number;
  stability: number;
}

// --- Members ---
export const members: HouseholdMember[] = [
  { id: "m1", name: "Andi Pratama", email: "andi@email.com", role: "owner", avatar: "AP" },
  { id: "m2", name: "Sari Pratama", email: "sari@email.com", role: "member", avatar: "SP" },
];

// --- Wallets ---
export const wallets: Wallet[] = [
  { id: "w1", name: "Cash", type: "cash", balance: 1_250_000, icon: "Banknote", color: "hsl(152 60% 42%)" },
  { id: "w2", name: "BCA", type: "bank", balance: 12_800_000, icon: "Building2", color: "hsl(217 70% 50%)" },
  { id: "w3", name: "GoPay", type: "ewallet", balance: 850_000, icon: "Smartphone", color: "hsl(187 70% 42%)" },
];

// --- Transactions ---
export const transactions: Transaction[] = [
  { id: "t1", date: "2026-04-09", description: "Gaji Bulanan", amount: 12_000_000, type: "income", category: "Gaji", walletId: "w2", memberId: "m1" },
  { id: "t2", date: "2026-04-08", description: "Belanja Supermarket", amount: 450_000, type: "expense", category: "Belanja", walletId: "w2", memberId: "m2" },
  { id: "t3", date: "2026-04-08", description: "Listrik & Air", amount: 380_000, type: "expense", category: "Utilitas", walletId: "w2", memberId: "m1" },
  { id: "t4", date: "2026-04-07", description: "Makan Siang", amount: 35_000, type: "expense", category: "Makanan", walletId: "w1", memberId: "m2" },
  { id: "t5", date: "2026-04-07", description: "Transfer ke GoPay", amount: 500_000, type: "transfer", category: "Transfer", walletId: "w2", walletToId: "w3", memberId: "m1" },
  { id: "t6", date: "2026-04-06", description: "Grab ke Kantor", amount: 28_000, type: "expense", category: "Transportasi", walletId: "w3", memberId: "m1" },
  { id: "t7", date: "2026-04-06", description: "Freelance Design", amount: 2_500_000, type: "income", category: "Freelance", walletId: "w2", memberId: "m2" },
  { id: "t8", date: "2026-04-05", description: "Beli Obat", amount: 75_000, type: "expense", category: "Kesehatan", walletId: "w1", memberId: "m2" },
  { id: "t9", date: "2026-04-05", description: "Bensin Motor", amount: 50_000, type: "expense", category: "Transportasi", walletId: "w1", memberId: "m1" },
  { id: "t10", date: "2026-04-04", description: "Langganan Netflix", amount: 54_000, type: "expense", category: "Hiburan", walletId: "w3", memberId: "m1" },
  { id: "t11", date: "2026-04-04", description: "Uang Jajan Anak", amount: 200_000, type: "expense", category: "Lainnya", walletId: "w1", memberId: "m2" },
  { id: "t12", date: "2026-04-03", description: "Beli Buku Sekolah", amount: 125_000, type: "expense", category: "Pendidikan", walletId: "w2", memberId: "m2" },
  { id: "t13", date: "2026-04-03", description: "Kopi Pagi", amount: 25_000, type: "expense", category: "Makanan", walletId: "w3", memberId: "m1" },
  { id: "t14", date: "2026-04-02", description: "Service AC", amount: 350_000, type: "expense", category: "Rumah Tangga", walletId: "w2", memberId: "m1" },
  { id: "t15", date: "2026-04-01", description: "Bonus Proyek", amount: 3_000_000, type: "income", category: "Bonus", walletId: "w2", memberId: "m1" },
  { id: "t16", date: "2026-04-01", description: "Tarik Tunai ATM", amount: 1_000_000, type: "transfer", category: "Transfer", walletId: "w2", walletToId: "w1", memberId: "m1" },
];

// --- Budgets ---
export const budgets: Budget[] = [
  { id: "b1", category: "Makanan", limit: 2_000_000, spent: 1_650_000, icon: "UtensilsCrossed" },
  { id: "b2", category: "Transportasi", limit: 800_000, spent: 578_000, icon: "Car" },
  { id: "b3", category: "Belanja", limit: 1_500_000, spent: 1_350_000, icon: "ShoppingCart" },
  { id: "b4", category: "Hiburan", limit: 500_000, spent: 254_000, icon: "Gamepad2" },
  { id: "b5", category: "Utilitas", limit: 1_000_000, spent: 380_000, icon: "Zap" },
];

// --- Notifications ---
export const notifications: Notification[] = [
  { id: "n1", title: "Anggaran Belanja Hampir Habis", message: "Kamu sudah memakai 90% anggaran Belanja bulan ini.", date: "2026-04-08", read: false, type: "warning" },
  { id: "n2", title: "Laporan Maret Tersedia", message: "Ringkasan keuangan bulan Maret sudah siap dilihat.", date: "2026-04-01", read: false, type: "info" },
  { id: "n3", title: "Saldo GoPay Rendah", message: "Saldo GoPay kamu di bawah Rp 100.000.", date: "2026-04-06", read: true, type: "warning" },
  { id: "n4", title: "Target Tabungan Tercapai!", message: "Selamat! Emergency fund kamu sudah mencapai 3 bulan pengeluaran.", date: "2026-03-28", read: true, type: "success" },
];

// --- Audit Log ---
export const auditLog: AuditEntry[] = [
  { id: "a1", entity: "Transaksi", action: "create", before: "-", after: "Gaji Bulanan Rp 12.000.000", memberId: "m1", date: "2026-04-09 08:15" },
  { id: "a2", entity: "Budget", action: "update", before: "Makanan: Rp 1.500.000", after: "Makanan: Rp 2.000.000", memberId: "m1", date: "2026-04-01 10:30" },
  { id: "a3", entity: "Wallet", action: "create", before: "-", after: "GoPay ditambahkan", memberId: "m1", date: "2026-03-15 14:00" },
  { id: "a4", entity: "Anggota", action: "update", before: "Sari: viewer", after: "Sari: member", memberId: "m1", date: "2026-03-10 09:00" },
  { id: "a5", entity: "Transaksi", action: "delete", before: "Makan Siang Rp 50.000", after: "-", memberId: "m2", date: "2026-04-05 12:00" },
];

// --- Health Score ---
export const healthScore: HealthScore = {
  overall: 72,
  savingRate: 78,
  emergencyFund: 65,
  debtRatio: 85,
  stability: 60,
};

export const healthHistory = [
  { month: "Nov", score: 58 },
  { month: "Des", score: 62 },
  { month: "Jan", score: 65 },
  { month: "Feb", score: 68 },
  { month: "Mar", score: 70 },
  { month: "Apr", score: 72 },
];

// --- Monthly summary ---
export const monthlySummary = [
  { month: "Jan", income: 14_000_000, expense: 8_500_000 },
  { month: "Feb", income: 12_500_000, expense: 9_200_000 },
  { month: "Mar", income: 15_000_000, expense: 7_800_000 },
  { month: "Apr", income: 17_500_000, expense: 4_200_000 },
];

// --- Helpers ---
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function getTotalBalance(): number {
  return wallets.reduce((sum, w) => sum + w.balance, 0);
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    Gaji: "Briefcase", Freelance: "PenTool", Bonus: "Gift",
    Makanan: "UtensilsCrossed", Belanja: "ShoppingCart", Transportasi: "Car",
    Utilitas: "Zap", Kesehatan: "Heart", Hiburan: "Gamepad2",
    Pendidikan: "GraduationCap", "Rumah Tangga": "Home", Transfer: "ArrowLeftRight",
    Lainnya: "MoreHorizontal",
  };
  return map[category] || "Circle";
}
