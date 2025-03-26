import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;
  let user;

  try {
    user = await prisma.user.create({
      data: { username, password },
    });
  } catch (err) {
    console.warn(err);
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }

  return NextResponse.json(user, { status: 201 });
}
