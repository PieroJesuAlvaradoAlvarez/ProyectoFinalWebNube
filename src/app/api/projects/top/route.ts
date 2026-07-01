import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Get active projects (status: OPEN), ordered by (likes + reposts) descending
    const projects = await prisma.project.findMany({
      where: { status: "OPEN" },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Sort by (likes + reposts) descending
    const sortedProjects = projects.sort((a, b) => {
      const aScore = a._count.likes + a._count.reposts;
      const bScore = b._count.likes + b._count.reposts;
      return bScore - aScore;
    }).slice(0, 5); // Top 5

    return NextResponse.json(sortedProjects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching top projects" }, { status: 500 });
  }
}
