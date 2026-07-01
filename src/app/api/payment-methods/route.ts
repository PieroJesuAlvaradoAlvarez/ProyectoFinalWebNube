import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("GET PAYMENT METHODS ERROR:", error);
    return NextResponse.json({ error: "Error al obtener métodos de pago" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      type,
      cardNumber,
      cardExpiry,
      cardCvc,
      yapeNumber,
      bcpAccount,
      transferAccount,
      paypalEmail
    } = body;

    if (!userId || !type) {
      return NextResponse.json({ error: "User ID and type required" }, { status: 400 });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        cardNumber,
        cardExpiry,
        cardCvc,
        yapeNumber,
        bcpAccount,
        transferAccount,
        paypalEmail
      }
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error("POST PAYMENT METHOD ERROR:", error);
    return NextResponse.json({ error: "Error al crear método de pago" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 });
    }

    await prisma.paymentMethod.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE PAYMENT METHOD ERROR:", error);
    return NextResponse.json({ error: "Error al eliminar método de pago" }, { status: 500 });
  }
}
