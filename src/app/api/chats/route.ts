import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get all chats where user is user1 or user2
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: { select: { id: true, name: true, email: true, image: true } },
        user2: { select: { id: true, name: true, email: true, image: true } },
        project: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("GET CHATS ERROR:", error);
    return NextResponse.json({ error: "Error al obtener chats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, user1Id, user2Id } = body;

    // Check if chat already exists
    let whereCondition: any = {};
    if (projectId) {
      whereCondition.projectId_user1Id_user2Id = {
        projectId,
        user1Id,
        user2Id
      };
    } else {
      // Check both orderings for direct chat
      const existingChat1 = await prisma.chat.findFirst({
        where: {
          OR: [
            { user1Id, user2Id, projectId: null },
            { user1Id: user2Id, user2Id: user1Id, projectId: null }
          ]
        }
      });
      if (existingChat1) {
        return NextResponse.json(existingChat1);
      }
    }

    const chat = await prisma.chat.create({
      data: {
        projectId,
        user1Id,
        user2Id
      },
      include: {
        user1: true,
        user2: true,
        project: true
      }
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("POST CHAT ERROR:", error);
    return NextResponse.json({ error: "Error al crear chat" }, { status: 500 });
  }
}
