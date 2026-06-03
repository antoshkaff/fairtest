"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Send } from "lucide-react";
import { usePublishTest } from "@/features/test-management/publish-test/use-publish-test";
import { Button } from "@/shared/ui/Button";
import { Spinner } from "@/shared/ui/Spinner";

type TestTableActionsProps = {
  testId: string;
  isPublished: boolean;
};

export function TestTableActions({ testId, isPublished }: TestTableActionsProps) {
  const [copied, setCopied] = useState(false);
  const publishMutation = usePublishTest(testId);
  const publicPath = `/test/${testId}`;
  const teacherPath = `/teacher/tests/${testId}`;
  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return publicPath;
    }
    return `${window.location.origin}${publicPath}`;
  }, [publicPath]);

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex justify-end gap-2">
      <Link href={teacherPath}>
        <Button type="button" variant="secondary">
          <ExternalLink size={16} />
          Відкрити тест
        </Button>
      </Link>
      {isPublished ? (
        <Button type="button" variant="success" onClick={copyLink}>
          <Copy size={16} />
          {copied ? "Скопійовано" : "Копіювати"}
        </Button>
      ) : (
        <Button
          type="button"
          variant="success"
          onClick={() => publishMutation.mutate()}
          disabled={publishMutation.isPending}
        >
          {publishMutation.isPending ? (
            <Spinner label="Публікація" />
          ) : (
            <>
              <Send size={16} /> Опублікувати
            </>
          )}
        </Button>
      )}
    </div>
  );
}
