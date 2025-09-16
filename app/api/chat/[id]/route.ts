import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomId = id;

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.roomId, roomId))
      .orderBy(messagesTable.createdAt);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomId = id;
    const { sender, text } = await request.json();

    if (!sender || !text) {
      return NextResponse.json(
        { error: "Sender and text are required" },
        { status: 400 }
      );
    }

    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        roomId,
        sender,
        text,
      })
      .returning();

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
