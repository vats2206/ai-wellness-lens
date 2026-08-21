import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { fetchScans, formatDate } from "@/lib/scan-data";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_authenticated/reports")({ component: ReportsPage });
function ReportsPage() {
 const query = useQuery({ queryKey:["scans"], queryFn: fetchScans });
 const completed=(query.data??[]).filter(s=>s.status==="complete");
 const average=(items: typeof completed)=>items.length ? Math.round(items.reduce((sum,s)=>sum+(s.wellness_score??0),0)/items.length) : null;
 const now=Date.now(), week=completed.filter(s=>now-new Date(s.created_at).getTime()<7*864e5), month=completed.filter(s=>now-new Date(s.created_at).getTime()<30*864e5);
 const Card=({label,items}:{label:string;items:typeof completed})=><section className="glass-card p-8"><p className="text-xs tracking-[.25em] text-muted-foreground uppercase">{label}</p><p className="font-display mt-5 text-6xl">{average(items)??"—"}</p><p className="mt-3 text-sm text-muted-foreground">{items.length ? `${items.length} completed scan${items.length===1?"":"s"} • latest ${formatDate(items[0].created_at)}` : "Complete a scan to generate this summary."}</p><Button variant="ghost" onClick={()=>window.print()} className="glass mt-6 rounded-full"><Download className="mr-2 size-4"/>Download PDF</Button></section>;
 return <div className="animate-fade-rise space-y-5"><div><p className="text-xs tracking-[.3em] text-muted-foreground uppercase">Reports</p><h1 className="font-display mt-3 text-4xl sm:text-5xl">Your wellness <span className="text-muted-foreground italic">rhythm.</span></h1></div><div className="grid gap-5 md:grid-cols-2"><Card label="Weekly wellness report" items={week}/><Card label="Monthly wellness report" items={month}/></div></div>;
}