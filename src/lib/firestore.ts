import { useState, useEffect } from "react";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, onSnapshot, Timestamp, setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ---- Types ----
export interface FirestoreWallet {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet";
  balance: number;
  createdAt: Date;
}

export interface FirestoreTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  walletId: string;
  walletToId?: string;
  memberId: string;
  note?: string;
  createdAt: Date;
}

export interface FirestoreBudget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
  createdAt: Date;
}

export interface FirestoreMember {
  id: string;
  email: string;
  displayName: string;
  role: "owner" | "member";
  joinedAt: Date;
}

export interface FirestoreNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "warning" | "info" | "success";
}

export interface FirestoreAuditEntry {
  id: string;
  entity: string;
  action: string;
  before: string;
  after: string;
  memberId: string;
  memberName: string;
  date: string;
}

export interface HouseholdData {
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
}

// ---- Formatters ----
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

// ---- Real-time hooks ----

export function useHousehold(householdId: string | null) {
  const [data, setData] = useState<HouseholdData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "households", householdId), (snap) => {
      if (snap.exists()) {
        setData(snap.data() as HouseholdData);
      }
      setLoading(false);
    });
    return unsub;
  }, [householdId]);

  return { household: data, loading };
}

export function useWallets(householdId: string | null) {
  const [wallets, setWallets] = useState<FirestoreWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(
      collection(db, "households", householdId, "wallets"),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreWallet));
        setWallets(items);
        setLoading(false);
      }
    );
    return unsub;
  }, [householdId]);

  return { wallets, loading };
}

export function useTransactions(householdId: string | null) {
  const [transactions, setTransactions] = useState<FirestoreTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(collection(db, "households", householdId, "transactions"), orderBy("date", "desc")),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreTransaction));
        setTransactions(items);
        setLoading(false);
      },
      (err) => {
        console.error("Transactions listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [householdId]);

  return { transactions, loading };
}

export function useBudgets(householdId: string | null) {
  const [budgets, setBudgets] = useState<FirestoreBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(
      collection(db, "households", householdId, "budgets"),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBudget));
        setBudgets(items);
        setLoading(false);
      }
    );
    return unsub;
  }, [householdId]);

  return { budgets, loading };
}

export function useMembers(householdId: string | null) {
  const [members, setMembers] = useState<FirestoreMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(
      collection(db, "households", householdId, "members"),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreMember));
        setMembers(items);
        setLoading(false);
      }
    );
    return unsub;
  }, [householdId]);

  return { members, loading };
}

export function useNotifications(householdId: string | null) {
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(collection(db, "households", householdId, "notifications"), orderBy("date", "desc")),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreNotification));
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        console.error("Notifications listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [householdId]);

  return { notifications, loading };
}

export function useAuditLog(householdId: string | null) {
  const [auditLog, setAuditLog] = useState<FirestoreAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(
      query(collection(db, "households", householdId, "auditLog"), orderBy("date", "desc")),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreAuditEntry));
        setAuditLog(items);
        setLoading(false);
      },
      (err) => {
        console.error("Audit log listener error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [householdId]);

  return { auditLog, loading };
}

// ---- Write operations ----

export async function addTransaction(householdId: string, data: Omit<FirestoreTransaction, "id" | "createdAt">) {
  // Remove undefined values - Firestore doesn't accept them
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, "households", householdId, "transactions"), {
    ...cleanData,
    createdAt: new Date(),
  });

  // Update wallet balance
  const walletRef = doc(db, "households", householdId, "wallets", data.walletId);
  const walletSnap = await getDoc(walletRef);
  if (walletSnap.exists()) {
    const current = walletSnap.data().balance || 0;
    const delta = data.type === "income" ? data.amount : -data.amount;
    await updateDoc(walletRef, { balance: current + delta });
  }

  // For transfers, update destination wallet
  if (data.type === "transfer" && data.walletToId) {
    const toRef = doc(db, "households", householdId, "wallets", data.walletToId);
    const toSnap = await getDoc(toRef);
    if (toSnap.exists()) {
      await updateDoc(toRef, { balance: (toSnap.data().balance || 0) + data.amount });
    }
  }

  // Update budget spent (for expenses)
  if (data.type === "expense") {
    const budgetsSnap = await getDocs(collection(db, "households", householdId, "budgets"));
    const matchingBudget = budgetsSnap.docs.find((d) => d.data().category === data.category);
    if (matchingBudget) {
      await updateDoc(doc(db, "households", householdId, "budgets", matchingBudget.id), {
        spent: (matchingBudget.data().spent || 0) + data.amount,
      });
    }
  }

  // Add audit log
  await addDoc(collection(db, "households", householdId, "auditLog"), {
    entity: "Transaksi",
    action: "create",
    before: "-",
    after: `${data.description} ${formatRupiah(data.amount)}`,
    memberId: data.memberId,
    memberName: "",
    date: new Date().toISOString(),
  });

  return ref.id;
}

export async function addWallet(householdId: string, data: { name: string; type: string; balance: number }) {
  const ref = await addDoc(collection(db, "households", householdId, "wallets"), {
    ...data,
    createdAt: new Date(),
  });
  await addDoc(collection(db, "households", householdId, "auditLog"), {
    entity: "Wallet",
    action: "create",
    before: "-",
    after: `${data.name} ditambahkan`,
    memberId: "",
    memberName: "",
    date: new Date().toISOString(),
  });
  return ref.id;
}

export async function addBudget(householdId: string, data: { category: string; limit: number; icon?: string }) {
  const ref = await addDoc(collection(db, "households", householdId, "budgets"), {
    category: data.category,
    limit: data.limit,
    spent: 0,
    icon: data.icon || "📊",
    createdAt: new Date(),
  });
  return ref.id;
}

export async function inviteMember(householdId: string, email: string) {
  // Add to invitations subcollection
  await addDoc(collection(db, "households", householdId, "invitations"), {
    email: email.toLowerCase(),
    status: "pending",
    invitedAt: new Date(),
  });

  // Also add to members subcollection as pending
  await addDoc(collection(db, "households", householdId, "members"), {
    email: email.toLowerCase(),
    displayName: email.split("@")[0],
    role: "member",
    status: "invited",
    joinedAt: new Date(),
  });

  // Add notification
  await addDoc(collection(db, "households", householdId, "notifications"), {
    title: "Undangan Terkirim",
    message: `Undangan telah dikirim ke ${email}`,
    date: new Date().toISOString().split("T")[0],
    read: false,
    type: "info",
  });

  // Add audit log
  await addDoc(collection(db, "households", householdId, "auditLog"), {
    entity: "Anggota",
    action: "create",
    before: "-",
    after: `${email} diundang`,
    memberId: "",
    memberName: "",
    date: new Date().toISOString(),
  });
}

export async function markNotificationRead(householdId: string, notificationId: string) {
  await updateDoc(doc(db, "households", householdId, "notifications", notificationId), { read: true });
}

export async function markAllNotificationsRead(householdId: string) {
  const snap = await getDocs(
    query(collection(db, "households", householdId, "notifications"), where("read", "==", false))
  );
  const promises = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(promises);
}

// ---- Wallet update ----
export async function updateWalletBalance(householdId: string, walletId: string, newBalance: number) {
  const walletRef = doc(db, "households", householdId, "wallets", walletId);
  await updateDoc(walletRef, { balance: newBalance });
}

export async function updateWallet(householdId: string, walletId: string, data: Partial<Omit<FirestoreWallet, "id" | "createdAt">>) {
  const walletRef = doc(db, "households", householdId, "wallets", walletId);
  await updateDoc(walletRef, data);
}

export async function deleteWallet(householdId: string, walletId: string) {
  await deleteDoc(doc(db, "households", householdId, "wallets", walletId));
}

// ---- Budget CRUD ----
export async function updateBudget(householdId: string, budgetId: string, data: Partial<Omit<FirestoreBudget, "id" | "createdAt">>) {
  const budgetRef = doc(db, "households", householdId, "budgets", budgetId);
  await updateDoc(budgetRef, data);
}

export async function deleteBudget(householdId: string, budgetId: string) {
  await deleteDoc(doc(db, "households", householdId, "budgets", budgetId));
}

// ---- Categories ----
export interface FirestoreCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  createdAt: Date;
}

export function useCategories(householdId: string | null) {
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) { setLoading(false); return; }
    const unsub = onSnapshot(
      collection(db, "households", householdId, "categories"),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCategory));
        setCategories(items);
        setLoading(false);
      }
    );
    return unsub;
  }, [householdId]);

  return { categories, loading };
}

export async function addCategory(householdId: string, data: { name: string; type: "income" | "expense" }) {
  const ref = await addDoc(collection(db, "households", householdId, "categories"), {
    ...data,
    createdAt: new Date(),
  });
  return ref.id;
}

export async function updateCategory(householdId: string, categoryId: string, data: { name: string; type: "income" | "expense" }) {
  await updateDoc(doc(db, "households", householdId, "categories", categoryId), data);
}

export async function deleteCategory(householdId: string, categoryId: string) {
  await deleteDoc(doc(db, "households", householdId, "categories", categoryId));
}

// ---- Profile update ----
export async function updateUserDisplayName(userId: string, displayName: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { displayName });
}
