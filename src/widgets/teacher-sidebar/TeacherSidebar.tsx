"use client";

import Link from "next/link";
import { ClipboardList, LogOut } from "lucide-react";
import { useLogoutTeacher } from "@/features/auth/logout/use-logout-teacher";
import { Sidebar } from "@/shared/ui/Sidebar";
import { Spinner } from "@/shared/ui/Spinner";

export function TeacherSidebar() {
  const logoutMutation = useLogoutTeacher();

  return (
    <Sidebar>
      <div className="text-lg font-semibold text-primary">FairTest</div>
      <nav className="mt-6 space-y-1 text-sm">
        <Link
          className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-primary-light hover:text-primary"
          href="/teacher/tests"
        >
          <ClipboardList size={16} /> Тести
        </Link>
        <button
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-muted-foreground hover:bg-primary-light hover:text-primary disabled:opacity-60"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Spinner label="Вихід" />
          ) : (
            <>
              <LogOut size={16} /> Вийти
            </>
          )}
        </button>
      </nav>
    </Sidebar>
  );
}
