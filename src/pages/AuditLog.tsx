import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditLog } from "@/lib/firestore";
import PageTransition from "@/components/PageTransition";

const actionColors: Record<string, string> = {
  create: "bg-success/10 text-success",
  update: "bg-warning/10 text-warning",
  delete: "bg-destructive/10 text-destructive",
};

const actionLabels: Record<string, string> = {
  create: "Buat",
  update: "Ubah",
  delete: "Hapus",
};

const AuditLog = () => {
  const { householdId } = useAuth();
  const { auditLog, loading } = useAuditLog(householdId);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <h1 className="text-lg font-bold">Audit Log</h1>

        {loading && <p className="text-sm text-muted-foreground text-center py-8">Memuat...</p>}
        {!loading && auditLog.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada aktivitas tercatat</p>
        )}

        <div className="space-y-2">
          {auditLog.map((log) => (
            <Card key={log.id} className="border-0 shadow-sm">
              <CardContent className="py-3">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{log.entity}</Badge>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${actionColors[log.action] || ""}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(log.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-xs space-y-0.5">
                  {log.before !== "-" && <p className="text-muted-foreground"><span className="text-destructive/70">Sebelum:</span> {log.before}</p>}
                  {log.after !== "-" && <p className="text-muted-foreground"><span className="text-success/70">Sesudah:</span> {log.after}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default AuditLog;
