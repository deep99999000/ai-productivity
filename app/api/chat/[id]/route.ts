import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// 📥 GET - Fetch all messages for a room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔍 Extract room ID from params
    const { id } = await params;
    const roomId = id;

    // 📊 Query messages from database
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.roomId, roomId))
      .orderBy(messagesTable.createdAt);

    return NextResponse.json({ messages });
  } catch (error) {
    // ⚠️ Handle errors
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// 📤 POST - Create a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔍 Extract room ID from params
    const { id } = await params;
    const roomId = id;
    
    // 📝 Parse request body
    const { sender, text } = await request.json();

    // ✅ Validate input
    if (!sender || !text) {
      return NextResponse.json(
        { error: "Sender and text are required" },
        { status: 400 }
      );
    }

    // 💾 Insert new message
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
    // ⚠️ Handle errors
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
