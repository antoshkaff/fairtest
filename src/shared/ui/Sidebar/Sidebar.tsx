import type { ReactNode } from "react";

export function Sidebar({ children }: { children: ReactNode }) {
  return <aside className="w-64 border-r border-border bg-white p-4 shadow-sm">{children}</aside>;
}
