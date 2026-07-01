import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chatId = url.searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatId, senderId, content } = body;

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("POST MESSAGE ERROR:", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
