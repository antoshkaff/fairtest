import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-normal text-primary">FairTest</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Система створення тестів, проходження спроб і перегляду поведінкових подій без збору
          приватних даних студента.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Кабінет викладача</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Керуйте тестами, публікацією та результатами.
          </p>
          <Link href="/login" className="mt-4 inline-flex">
            <Button>Увійти</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Проходження тесту</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Відкрийте посилання на опублікований тест, яке надав викладач.
          </p>
        </Card>
      </div>
    </main>
  );
}
