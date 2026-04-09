import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  setupComplete: boolean;
  householdId: string | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSetupStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    setupComplete: false,
    householdId: null,
  });

  const checkSetupStatus = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setState((prev) => ({
          ...prev,
          setupComplete: data.setupComplete === true,
          householdId: data.householdId || null,
        }));
      } else {
        setState((prev) => ({ ...prev, setupComplete: false, householdId: null }));
      }
    } catch (err) {
      console.error("Error checking setup status:", err);
      setState((prev) => ({ ...prev, setupComplete: false, householdId: null }));
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setState((prev) => ({ ...prev, user, loading: true }));
        await checkSetupStatus(user);
        setState((prev) => ({ ...prev, loading: false }));
      } else {
        setState({ user: null, loading: false, setupComplete: false, householdId: null });
      }
    });
    return unsub;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const refreshSetupStatus = async () => {
    if (state.user) {
      await checkSetupStatus(state.user);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshSetupStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
