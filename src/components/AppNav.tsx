import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Dashboard", to: "/dashboard" }, { label: "New Scan", to: "/scan" },
  { label: "History", to: "/history" }, { label: "Reports", to: "/reports" },
  { label: "Coach", to: "/coach" }, { label: "Profile", to: "/profile" }, { label: "Settings", to: "/settings" },
] as const;

export function AppNav() {
 const { signOut }=useAuth(); const navigate=useNavigate(); const [open,setOpen]=useState(false);
 const handleSignOut=async()=>{await signOut();navigate({to:"/"});};
 return <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"><nav className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
  <Link to="/dashboard" className="font-display text-lg tracking-tight">VISION-FIT<span className="align-super text-[0.6em] text-muted-foreground">®</span></Link>
  <ul className="hidden items-center gap-5 xl:flex">{links.map(l=><li key={l.to}><Link to={l.to} activeProps={{className:"text-foreground"}} inactiveProps={{className:"text-muted-foreground"}} className="text-sm transition-colors duration-300 hover:text-foreground">{l.label}</Link></li>)}</ul>
  <div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden rounded-full text-muted-foreground hover:text-foreground sm:inline-flex"><LogOut className="mr-2 size-4"/>Sign out</Button><button aria-label="Toggle menu" onClick={()=>setOpen(v=>!v)} className="rounded-full p-2 transition-colors hover:bg-accent/40 xl:hidden">{open?<X className="size-5"/>:<Menu className="size-5"/>}</button></div>
 </nav>{open&&<div className="glass-strong animate-fade-in mx-auto mt-2 max-w-6xl rounded-3xl p-5 xl:hidden"><ul className="flex flex-col gap-4">{links.map(l=><li key={l.to}><Link to={l.to} onClick={()=>setOpen(false)} className="text-base text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link></li>)}</ul><Button variant="ghost" onClick={handleSignOut} className="glass mt-5 w-full rounded-full text-foreground"><LogOut className="mr-2 size-4"/>Sign out</Button></div>}</header>;
}