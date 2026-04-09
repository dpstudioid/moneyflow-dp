import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, UserPlus, Crown, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold, useMembers, inviteMember } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const HouseholdSetup = () => {
  const navigate = useNavigate();
  const { householdId } = useAuth();
  const { household } = useHousehold(householdId);
  const { members } = useMembers(householdId);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!householdId || !inviteEmail.trim()) return;
    if (!inviteEmail.includes("@")) {
      toast({ title: "Email tidak valid", variant: "destructive" });
      return;
    }
    setInviting(true);
    try {
      await inviteMember(householdId, inviteEmail.trim());
      toast({ title: "Undangan terkirim! ✅", description: `Undangan dikirim ke ${inviteEmail}` });
      setInviteEmail("");
    } catch (err: any) {
      toast({ title: "Gagal mengundang", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/settings")}>
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-2">
              <Home className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{household?.name || "Rumah Tangga"}</h1>
            <p className="text-muted-foreground text-sm">Kelola anggota keluarga kamu</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Anggota ({members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
                      {m.displayName?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{m.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                  </div>
                  <Badge variant={m.role === "owner" ? "default" : "secondary"} className="text-xs gap-1">
                    {m.role === "owner" ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {m.role === "owner" ? "Owner" : "Member"}
                  </Badge>
                </div>
              ))}

              {members.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">Belum ada anggota</p>
              )}

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-2 block">Undang Anggota Baru</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email anggota baru"
                    className="flex-1"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  />
                  <Button size="icon" variant="outline" onClick={handleInvite} disabled={inviting}>
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Masukkan email orang yang ingin kamu undang</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default HouseholdSetup;
