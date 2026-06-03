"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { readApi } from "@/shared/api/read-api";

async function loginTeacher(formData: FormData) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });

  return readApi(response);
}

export function useLoginTeacher() {
  const router = useRouter();

  return useMutation({
    mutationFn: loginTeacher,
    onSuccess: () => router.push("/teacher/tests"),
  });
}
