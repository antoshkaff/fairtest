"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { readApi } from "@/shared/api/read-api";
import type { PendingBehaviorEvent, PublicTest } from "./types";

export function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function usePassTest(test: PublicTest) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pendingEventsRef = useRef<PendingBehaviorEvent[]>([]);
  const questionStartedAtRef = useRef(Date.now());
  const finishedByTimerRef = useRef(false);
  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const timeLimitSeconds = test.timeLimitMinutes ? test.timeLimitMinutes * 60 : null;
  const remainingSeconds =
    timeLimitSeconds == null ? null : Math.max(0, timeLimitSeconds - elapsedSeconds);
  const progress = useMemo(
    () => ((currentQuestionIndex + 1) / test.questions.length) * 100,
    [currentQuestionIndex, test.questions.length],
  );

  const startMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: test.id,
          participantFirstName: formData.get("participantFirstName"),
          participantLastName: formData.get("participantLastName"),
        }),
      });
      return readApi<{ id: string }>(response);
    },
    onSuccess: (attempt) => {
      pendingEventsRef.current = [];
      questionStartedAtRef.current = Date.now();
      setElapsedSeconds(0);
      setAttemptId(attempt.id);
      setError(null);
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const saveBlockMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId || !currentQuestion) {
        throw new Error("Спробу тестування не знайдено.");
      }

      const answerValue = answers[currentQuestion.id];
      if (!answerValue?.trim()) {
        throw new Error("Дайте відповідь перед переходом далі.");
      }

      const duration = Math.floor((Date.now() - questionStartedAtRef.current) / 1000);
      const events = [
        ...pendingEventsRef.current,
        ...(duration > 120
          ? [
              {
                eventType: "suspicious_pause" as const,
                eventTime: new Date().toISOString(),
                duration,
                details: `questionId:${currentQuestion.id}`,
              },
            ]
          : []),
      ];

      const answerBody =
        currentQuestion.type === "single_choice"
          ? { questionId: currentQuestion.id, answerOptionId: answerValue }
          : { questionId: currentQuestion.id, answerText: answerValue };

      const requests: Promise<unknown>[] = [
        fetch(`/api/attempts/${attemptId}/answers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answerBody),
        }).then(readApi),
      ];

      if (events.length > 0) {
        requests.push(
          fetch(`/api/attempts/${attemptId}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events }),
          }).then(readApi),
        );
      }

      await Promise.all(requests);
    },
    onSuccess: () => {
      pendingEventsRef.current = [];
      questionStartedAtRef.current = Date.now();
      setError(null);
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) {
        throw new Error("Спробу тестування не знайдено.");
      }
      const response = await fetch(`/api/attempts/${attemptId}/finish`, { method: "POST" });
      return readApi(response);
    },
    onSuccess: () => {
      if (attemptId) {
        router.push(`/test/attempt/${attemptId}/finished`);
      }
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const goNext = useCallback(async () => {
    await saveBlockMutation.mutateAsync();
    setCurrentQuestionIndex((index) => index + 1);
  }, [saveBlockMutation]);

  const finish = useCallback(async () => {
    await saveBlockMutation.mutateAsync();
    finishMutation.mutate();
  }, [finishMutation, saveBlockMutation]);

  useEffect(() => {
    if (!attemptId) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId || !timeLimitSeconds || finishedByTimerRef.current) return;
    if (elapsedSeconds < timeLimitSeconds) return;

    finishedByTimerRef.current = true;
    setError("Час проходження завершився. Спробу буде автоматично завершено.");
    if (answers[currentQuestion.id]?.trim()) {
      void finish();
    } else {
      finishMutation.mutate();
    }
  }, [
    answers,
    attemptId,
    currentQuestion.id,
    elapsedSeconds,
    finish,
    finishMutation,
    timeLimitSeconds,
  ]);

  useEffect(() => {
    if (!attemptId) return;

    const pushEvent = (eventType: PendingBehaviorEvent["eventType"]) => {
      pendingEventsRef.current.push({
        eventType,
        eventTime: new Date().toISOString(),
        details: `questionId:${test.questions[currentQuestionIndex]?.id}`,
      });
    };

    const onVisibility = () => pushEvent(document.hidden ? "tab_hidden" : "tab_visible");
    const onBlur = () => pushEvent("window_blur");
    const onFocus = () => pushEvent("window_focus");
    const onCopy = () => pushEvent("copy");
    const onPaste = () => pushEvent("paste");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, [attemptId, currentQuestionIndex, test.questions]);

  return {
    attemptId,
    answers,
    currentQuestion,
    currentQuestionIndex,
    elapsedSeconds,
    error,
    finish,
    finishMutation,
    goNext,
    isLastQuestion,
    isSaving: saveBlockMutation.isPending || finishMutation.isPending,
    progress,
    remainingSeconds,
    setAnswers,
    startMutation,
    timeLimitSeconds,
  };
}
