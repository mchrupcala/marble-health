import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const events = await prisma.event.findMany({
    include: { owner: true },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, ownerId } = body;

  if (!ownerId) {
    return NextResponse.json({ error: "User missing" }, { status: 404 });
  }

  if (!name) {
    return NextResponse.json(
      { error: "Event name missing. Please try again." },
      { status: 404 }
    );
  }

  const event = await prisma.event.create({
    data: { name, ownerId },
  });

  return NextResponse.json(event, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, name, ownerId } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Event ID missing, please try again" },
      { status: 404 }
    );
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { name, ownerId },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Event ID missing, please try again" },
      { status: 404 }
    );
  }

  const deleted = await prisma.event.delete({
    where: { id },
  });

  return NextResponse.json(deleted);
}
