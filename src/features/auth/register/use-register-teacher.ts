"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { readApi } from "@/shared/api/read-api";

async function registerTeacher(formData: FormData) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });

  return readApi(response);
}

export function useRegisterTeacher() {
  const router = useRouter();

  return useMutation({
    mutationFn: registerTeacher,
    onSuccess: () => router.push("/teacher/tests"),
  });
}
