import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { NextRequest } from "next/server";

// GET - Fetch all notes for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const parentId = req.nextUrl.searchParams.get("parentId");
    const fetchAll = req.nextUrl.searchParams.get("all");

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const conditions = [eq(notes.userId, userId), eq(notes.isArchived, false)];
    
    // If not fetching all, filter by parent
    if (!fetchAll) {
      if (parentId) {
        conditions.push(eq(notes.parentId, parseInt(parentId)));
      } else {
        conditions.push(isNull(notes.parentId));
      }
    }

    const userNotes = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(asc(notes.order));

    return Response.json(userNotes);
  } catch (error) {
    console.error("[Notes API] Error fetching notes:", error);
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST - Create a new note
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, content, icon, parentId, coverImage } = body;

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const [newNote] = await db
      .insert(notes)
      .values({
        userId,
        title: title || "Untitled",
        content: content || "",
        icon: icon || "📄",
        parentId: parentId || null,
        coverImage: coverImage || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(newNote);
  } catch (error) {
    console.error("[Notes API] Error creating note:", error);
    return Response.json({ error: "Failed to create note" }, { status: 500 });
  }
}

// PATCH - Update a note
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, ...updates } = body;

    if (!id || !userId) {
      return Response.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const [updatedNote] = await db
      .update(notes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    return Response.json(updatedNote);
  } catch (error) {
    console.error("[Notes API] Error updating note:", error);
    return Response.json({ error: "Failed to update note" }, { status: 500 });
  }
}

// DELETE - Archive a note (soft delete)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, permanent } = body;

    if (!id || !userId) {
      return Response.json({ error: "Missing id or userId" }, { status: 400 });
    }

    if (permanent) {
      // Permanently delete
      await db
        .delete(notes)
        .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    } else {
      // Soft delete (archive)
      await db
        .update(notes)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Notes API] Error deleting note:", error);
    return Response.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
