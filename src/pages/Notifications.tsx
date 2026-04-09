import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/firestore";
import PageTransition from "@/components/PageTransition";

const Notifications = () => {
  const { householdId } = useAuth();
  const { notifications: notifs, loading } = useNotifications(householdId);
  const unread = notifs.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!householdId) return;
    await markAllNotificationsRead(householdId);
  };

  const handleMarkRead = async (id: string) => {
    if (!householdId) return;
    await markNotificationRead(householdId, id);
  };

  const iconMap = {
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-primary" />,
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Notifikasi</h1>
            {unread > 0 && <Badge>{unread}</Badge>}
          </div>
          {unread > 0 && <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>Tandai Dibaca</Button>}
        </div>

        {loading && <p className="text-sm text-muted-foreground text-center py-8">Memuat...</p>}
        {!loading && notifs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada notifikasi</p>
        )}

        <div className="space-y-2">
          {notifs.map((n) => (
            <Card key={n.id} className={`border-0 shadow-sm cursor-pointer transition-colors ${!n.read ? "bg-accent/50" : ""}`} onClick={() => handleMarkRead(n.id)}>
              <CardContent className="py-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">{iconMap[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.date).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default Notifications;
