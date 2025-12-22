import { db } from "@/db";
import { habitTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import type { Habit } from "@/features/habits/schema";
import { corsJsonResponse, corsErrorResponse, handlePreflight } from "@/lib/cors";

/**
 * OPTIONS /api/habits/[id]
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return handlePreflight();
}

/**
 * GET /api/habits/[id]
 * 
 * Fetches a single habit by ID.
 * 
 * Response:
 *   - 200: Habit object
 *   - 404: Habit not found
 *   - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habitId = parseInt(id, 10);

    if (isNaN(habitId)) {
      return corsErrorResponse("Invalid habit ID", 400);
    }

    console.log("[API] GET /api/habits/", habitId);

    const [habit] = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.id, habitId));

    if (!habit) {
      return corsErrorResponse("Habit not found", 404);
    }

    return corsJsonResponse(habit);
  } catch (error) {
    console.error("[API] GET /api/habits/[id] error:", error);
    return corsErrorResponse("Failed to fetch habit", 500);
  }
}

/**
 * PUT /api/habits/[id]
 * 
 * Updates an existing habit.
 * This mirrors the `updatewhabitaction` Server Action.
 * 
 * Request body: Partial Habit object (fields to update)
 * 
 * Response:
 *   - 200: Updated Habit object
 *   - 404: Habit not found
 *   - 500: Server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habitId = parseInt(id, 10);

    if (isNaN(habitId)) {
      return corsErrorResponse("Invalid habit ID", 400);
    }

    const body = await request.json();

    console.log("[API] PUT /api/habits/", habitId, "Body:", body);

    // Build update object (only include provided fields)
    const updateData: Partial<Habit> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.emoji !== undefined) updateData.emoji = body.emoji;
    if (body.highestStreak !== undefined) updateData.highestStreak = body.highestStreak;
    if (body.checkInDays !== undefined) updateData.checkInDays = body.checkInDays;

    // Update in database
    const updated = await db
      .update(habitTable)
      .set(updateData)
      .where(eq(habitTable.id, habitId))
      .returning();

    if (updated.length === 0) {
      return corsErrorResponse("Habit not found", 404);
    }

    console.log("[API] Updated habit:", updated[0]);

    return corsJsonResponse(updated[0]);
  } catch (error) {
    console.error("[API] PUT /api/habits/[id] error:", error);
    return corsErrorResponse("Failed to update habit", 500);
  }
}

/**
 * DELETE /api/habits/[id]
 * 
 * Deletes a habit by ID.
 * This mirrors the `deletehabitaction` Server Action.
 * 
 * Response:
 *   - 200: Deleted Habit object
 *   - 404: Habit not found
 *   - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habitId = parseInt(id, 10);

    if (isNaN(habitId)) {
      return corsErrorResponse("Invalid habit ID", 400);
    }

    console.log("[API] DELETE /api/habits/", habitId);

    const deleted = await db
      .delete(habitTable)
      .where(eq(habitTable.id, habitId))
      .returning();

    if (deleted.length === 0) {
      return corsErrorResponse("Habit not found", 404);
    }

    console.log("[API] Deleted habit:", deleted[0]);

    return corsJsonResponse(deleted[0]);
  } catch (error) {
    console.error("[API] DELETE /api/habits/[id] error:", error);
    return corsErrorResponse("Failed to delete habit", 500);
  }
}
