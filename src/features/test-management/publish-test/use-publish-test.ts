"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { readApi } from "@/shared/api/read-api";

async function publishTest(testId: string) {
  const response = await fetch(`/api/teacher/tests/${testId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" }),
  });

  return readApi(response);
}

export function usePublishTest(testId: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: () => publishTest(testId),
    onSuccess: () => router.refresh(),
  });
}
