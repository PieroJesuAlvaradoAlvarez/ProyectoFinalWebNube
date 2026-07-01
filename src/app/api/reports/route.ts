import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reporterId, reportedId, reason, description } = body;

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId,
        reason,
        description,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("REPORT POST ERROR:", error);
    return NextResponse.json(
      { error: "Error al enviar el reporte" },
      { status: 500 }
    );
  }
}
