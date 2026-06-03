import { Spinner } from "@/shared/ui/Spinner";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Spinner className="text-sm text-muted-foreground" />
    </main>
  );
}
