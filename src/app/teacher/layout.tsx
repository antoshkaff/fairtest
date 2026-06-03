import { redirect } from "next/navigation";
import { getTeacherFromCookies } from "@/lib/server/auth";
import { TeacherSidebar } from "@/widgets/teacher-sidebar/TeacherSidebar";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <TeacherSidebar />
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
