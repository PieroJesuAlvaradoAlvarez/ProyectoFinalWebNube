import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderId, receiverId } = body;

    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Ya has enviado una solicitud a este usuario" },
        { status: 400 }
      );
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });

    // Create notification for receiver
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
    });
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "FRIEND_REQUEST",
        message: `${sender?.name} te ha enviado una solicitud de amistad.`,
        link: "/profile/" + senderId,
      },
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error("FRIEND REQUEST POST ERROR:", error);
    return NextResponse.json(
      { error: "Error al enviar la solicitud" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id },
    });

    if (!friendRequest) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    const updatedRequest = await prisma.friendRequest.update({
      where: { id },
      data: { status },
    });

    // If accepted, create friendship
    if (status === "ACCEPTED") {
      await prisma.friendship.create({
        data: {
          userId1: friendRequest.senderId,
          userId2: friendRequest.receiverId,
        },
      });

      // Send notification to sender
      const receiver = await prisma.user.findUnique({
        where: { id: friendRequest.receiverId },
      });
      await prisma.notification.create({
        data: {
          userId: friendRequest.senderId,
          type: "FRIEND_ACCEPTED",
          message: `${receiver?.name} ha aceptado tu solicitud de amistad!`,
          link: "/profile/" + friendRequest.receiverId,
        },
      });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("FRIEND REQUEST PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Error al actualizar la solicitud" },
      { status: 500 }
    );
  }
}
