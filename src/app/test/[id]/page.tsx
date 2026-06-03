import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { PassTest } from "@/processes/pass-test/PassTest";

type PageProps = { params: Promise<{ id: string }> };

export default async function PublicTestPage({ params }: PageProps) {
  const { id } = await params;
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { select: { id: true, text: true } } },
      },
    },
  });

  if (!test || test.status !== "published") {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <PassTest test={test} />
    </main>
  );
}
