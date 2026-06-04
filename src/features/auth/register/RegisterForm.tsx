"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Spinner } from "@/shared/ui/Spinner";
import { useRegisterTeacher } from "./use-register-teacher";

export function RegisterForm() {
  const registerMutation = useRegisterTeacher();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    registerMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-semibold">Реєстрація викладача</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input name="name" placeholder="Ім'я" required minLength={2} maxLength={100} />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Пароль" required minLength={6} />
        {registerMutation.error ? (
          <p className="text-sm text-destructive">{registerMutation.error.message}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? <Spinner label="Реєстрація" /> : "Зареєструватися"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Вже маєте акаунт?{" "}
        <Link href="/login" className="font-medium text-primary">
          Увійти
        </Link>
      </p>
    </Card>
  );
}
