import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to get user with review stats
async function getUserWithStats(userId: string) {
  const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
        developedProjects: true,
        reviewsReceived: true,
        reposts: {
          include: {
            project: {
              include: {
                client: true,
                _count: {
                  select: {
                    likes: true,
                    reposts: true,
                    applications: true
                  }
                }
              }
            }
          }
        },
        paymentMethods: true,
      },
    });

  if (!user) return null;

  // Calculate average stars
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
    const user = await getUserWithStats(id);

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, bio, role, certificates, affiliation, age, phone, location, website } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        bio,
        role,
        certificates,
        affiliation,
        age: age ? Number(age) : null,
        phone,
        location,
        website
      },
    });

    const userWithStats = await getUserWithStats(id);
    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}
