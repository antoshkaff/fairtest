"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { readApi } from "@/shared/api/read-api";
import type { QuestionState } from "./types";

type CreateTestPayload = {
  title: FormDataEntryValue | null;
  description?: FormDataEntryValue | null;
  status: FormDataEntryValue | null;
  showScore: boolean;
  timeLimitMinutes?: number;
  questions: QuestionState[];
};

async function createTest(input: CreateTestPayload) {
  const response = await fetch("/api/teacher/tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return readApi(response);
}

export function useCreateTest() {
  const router = useRouter();

  return useMutation({
    mutationFn: createTest,
    onSuccess: () => router.push("/teacher/tests"),
  });
}
