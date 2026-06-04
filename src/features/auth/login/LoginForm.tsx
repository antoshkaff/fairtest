"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Spinner } from "@/shared/ui/Spinner";
import { useLoginTeacher } from "./use-login-teacher";

export function LoginForm() {
  const loginMutation = useLoginTeacher();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loginMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-semibold">Вхід викладача</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Пароль" required minLength={6} />
        {loginMutation.error ? (
          <p className="text-sm text-destructive">{loginMutation.error.message}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <Spinner label="Вхід" /> : "Увійти"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Немає акаунта?{" "}
        <Link href="/register" className="font-medium text-primary">
          Зареєструватися
        </Link>
      </p>
    </Card>
  );
}
