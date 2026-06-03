"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { readApi } from "@/shared/api/read-api";

async function logoutTeacher() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  return readApi(response);
}

export function useLogoutTeacher() {
  const router = useRouter();

  return useMutation({
    mutationFn: logoutTeacher,
    onSuccess: () => router.push("/login"),
  });
}
