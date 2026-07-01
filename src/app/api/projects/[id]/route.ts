import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getUserWithStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reviewsReceived: true,
    },
  });

  if (!user) return null;

  const averageStars = user.reviewsReceived.length > 0
    ? user.reviewsReceived.reduce((acc, curr) => acc + curr.stars, 0) / user.reviewsReceived.length
    : 0;

  return {
    ...user,
    averageStars: parseFloat(averageStars.toFixed(1)),
    reviewCount: user.reviewsReceived.length,
  };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        applications: {
          include: {
            developer: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    // Enhance applications with developer stats
    const enhancedApplications = await Promise.all(
      project.applications.map(async (app) => {
        const devWithStats = await getUserWithStats(app.developerId);
        return {
          ...app,
          developer: devWithStats,
        };
      })
    );

    return NextResponse.json({
      ...project,
      applications: enhancedApplications,
    });
  } catch (error) {
    console.error("GET PROJECT ERROR:", error);
    return NextResponse.json({ error: "Error al obtener proyecto" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, cancelReason, developerId } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        status,
        cancelReason,
        developerId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("PATCH PROJECT ERROR:", error);
    return NextResponse.json({ error: "Error al actualizar proyecto" }, { status: 500 });
  }
}
