import { Spinner } from "@/shared/ui/Spinner";

export default function TeacherLoading() {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-white">
      <Spinner className="text-sm text-muted-foreground" />
    </div>
  );
}
