import { db } from "@/db";
import { habitTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import type { NewHabit } from "@/features/habits/schema";
import { corsJsonResponse, corsErrorResponse, handlePreflight } from "@/lib/cors";

// 🔧 Static user ID for development (no auth required for now)
const STATIC_USER_ID = "37cd32f8-1b7f-4573-a126-bf72f852b42e";

/**
 * OPTIONS /api/habits
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return handlePreflight();
}

/**
 * GET /api/habits
 * 
 * Fetches all habits for the current user.
 * This mirrors the `getAllUserHabits` Server Action.
 * 
 * Query params:
 *   - user_id (optional): Override user ID (defaults to static ID)
 * 
 * Response:
 *   - 200: Array of Habit objects
 *   - 500: Error message
 */
export async function GET(request: NextRequest) {
  try {
    // Get user_id from query params or use static ID
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id") || STATIC_USER_ID;

    console.log("[API] GET /api/habits - user_id:", user_id);

    // Fetch all habits for the user
    const allHabits = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.user_id, user_id));

    console.log("[API] Found habits:", allHabits.length);

    return corsJsonResponse(allHabits);
  } catch (error) {
    console.error("[API] GET /api/habits error:", error);
    return corsErrorResponse("Failed to fetch habits", 500);
  }
}

/**
 * POST /api/habits
 * 
 * Creates a new habit.
 * This mirrors the `newhabitaction` Server Action.
 * 
 * Request body:
 *   - name: string (required)
 *   - description: string (optional)
 *   - emoji: string (optional, defaults to "✅")
 *   - id: number (required - generated on client)
 * 
 * Response:
 *   - 201: Created Habit object
 *   - 400: Validation error
 *   - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return corsErrorResponse("Name is required", 400);
    }

    if (!body.id || typeof body.id !== "number") {
      return corsErrorResponse("ID is required (generate on client)", 400);
    }

    // Build the new habit object
    const newHabit: NewHabit = {
      id: body.id,
      user_id: body.user_id || STATIC_USER_ID,
      name: body.name,
      description: body.description || null,
      emoji: body.emoji || "✅",
      highestStreak: body.highestStreak || 0,
      checkInDays: body.checkInDays || [],
    };

    console.log("[API] POST /api/habits - Creating:", newHabit);

    // Insert into database
    const inserted = await db
      .insert(habitTable)
      .values(newHabit)
      .returning();

    console.log("[API] Created habit:", inserted[0]);

    return corsJsonResponse(inserted[0], { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/habits error:", error);
    return corsErrorResponse("Failed to create habit", 500);
  }
}
