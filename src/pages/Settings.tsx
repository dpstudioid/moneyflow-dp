import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, LogOut, ChevronRight, Home, Users, Moon, Sun, Lock, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { updateProfile } from "firebase/auth";
import { updateUserDisplayName } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  const masked = "*".repeat(Math.max(local.length - 2, 1));
  return `${visible}${masked}@${domain}`;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleChangeName = async () => {
    if (!user || !newName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: newName.trim() });
      await updateUserDisplayName(user.uid, newName.trim());
      toast({ title: "Nama berhasil diubah! ✅" });
      setNameDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal mengubah nama", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  const menuItems = [
    { icon: Home, label: "Pengaturan Rumah Tangga", path: "/household-setup" },
    { icon: Users, label: "Kelola Anggota", path: "/household-setup" },
    { icon: Lock, label: "Keamanan", path: "#" },
  ];

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <h1 className="text-lg font-bold">Pengaturan</h1>

        {/* Profile */}
        <Card className="border-0 shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-semibold">{user?.displayName || "User"}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setNewName(user?.displayName || ""); setNameDialogOpen(true); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email ? maskEmail(user.email) : ""}</p>
                <Badge className="mt-1 text-[10px] gap-1"><Crown className="w-3 h-3" /> Owner</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dark Mode Toggle */}
        <Card className="border-0 shadow-sm">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              {resolvedTheme === "dark" ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              <span className="flex-1 text-sm font-medium">Mode Gelap</span>
              <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Menu */}
        <Card className="border-0 shadow-sm">
          <CardContent className="py-2 divide-y">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 py-3 w-full text-left hover:bg-accent/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> Keluar
        </Button>

        {/* Change Name Dialog */}
        <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ubah Nama</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Baru</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Masukkan nama baru" />
              </div>
              <Button className="w-full" onClick={handleChangeName} disabled={saving || !newName.trim()}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Settings;
