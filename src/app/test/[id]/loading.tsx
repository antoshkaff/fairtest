import { Spinner } from "@/shared/ui/Spinner";

export default function PublicTestLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Spinner className="text-sm text-muted-foreground" />
    </main>
  );
}
