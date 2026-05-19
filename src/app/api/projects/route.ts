import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, budget, duration, clientId, type, expiresAt, paymentMethod, category, technologies } = body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        duration,
        clientId,
        category,
        technologies,
        type: type || "UNITARY",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        paymentMethod,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("POST PROJECT ERROR:", error);
    return NextResponse.json({ error: "Error al crear proyecto" }, { status: 500 });
  }
}
