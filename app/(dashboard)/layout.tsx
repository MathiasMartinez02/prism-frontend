import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

// Shell compartido por todas las pantallas del dashboard: sidebar fijo + contenido a la derecha.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
