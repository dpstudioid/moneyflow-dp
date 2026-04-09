import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Plus, PiggyBank, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Wallet, BarChart3, HeartPulse, Bell, FileText, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/lib/firestore";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Beranda" },
  { path: "/transactions", icon: ArrowLeftRight, label: "Transaksi" },
  { path: "/add-transaction", icon: Plus, label: "Tambah", isCenter: true },
  { path: "/budget", icon: PiggyBank, label: "Anggaran" },
  { path: "/more", icon: Menu, label: "Lainnya" },
];

const moreItems = [
  { path: "/wallets", icon: Wallet, label: "Dompet" },
  { path: "/reports", icon: BarChart3, label: "Laporan" },
  { path: "/health", icon: HeartPulse, label: "Health Score" },
  { path: "/notifications", icon: Bell, label: "Notifikasi" },
  { path: "/audit", icon: FileText, label: "Audit Log" },
  { path: "/settings", icon: Settings, label: "Pengaturan" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const { householdId } = useAuth();
  const { notifications } = useNotifications(householdId);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            if (item.path === "/more") {
              return (
                <Sheet key="more" open={moreOpen} onOpenChange={setMoreOpen}>
                  <SheetTrigger asChild>
                    <button className="flex flex-col items-center justify-center gap-0.5 w-16 relative">
                      <div className="relative">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">{unread}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader><SheetTitle>Menu Lainnya</SheetTitle></SheetHeader>
                    <div className="grid grid-cols-3 gap-4 py-4">
                      {moreItems.map((mi) => (
                        <button key={mi.path} onClick={() => { setMoreOpen(false); navigate(mi.path); }} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-accent transition-colors relative">
                          <div className="relative">
                            <mi.icon className="w-6 h-6 text-foreground" />
                            {mi.path === "/notifications" && unread > 0 && (
                              <Badge className="absolute -top-2 -right-3 h-4 min-w-[16px] px-1 text-[10px]">{unread}</Badge>
                            )}
                          </div>
                          <span className="text-xs font-medium">{mi.label}</span>
                        </button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            const isActive = location.pathname === item.path;

            if (item.isCenter) {
              return (
                <button key={item.path} onClick={() => navigate(item.path)} className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg -mt-4">
                  <item.icon className="w-6 h-6" />
                </button>
              );
            }

            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center justify-center gap-0.5 w-16">
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px]", isActive ? "text-primary font-semibold" : "text-muted-foreground")}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
};

export default BottomNav;
