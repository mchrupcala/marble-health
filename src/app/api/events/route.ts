import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

// GET /api/events
export async function GET() {
  const events = await prisma.event.findMany({
    include: { owner: true },
  });

  return NextResponse.json(events);
}

// POST /api/events
export async function POST(req: Request) {
  const body = await req.json();
  const { name, ownerId } = body;

  const event = await prisma.event.create({
    data: { name, ownerId },
  });

  return NextResponse.json(event, { status: 201 });
}
