"use server";

import { prisma } from "@/lib/prisma";

export async function updateTriageStatus(rollNumber: string, status: string) {
  try {
    // We use updateMany because rollNumber is not explicitly marked @unique in schema
    await prisma.submission.updateMany({
      where: { rollNumber },
      data: { triageStatus: status }
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}
