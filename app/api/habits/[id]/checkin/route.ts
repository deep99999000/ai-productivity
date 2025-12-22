import { db } from "@/db";
import { habitTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { corsJsonResponse, corsErrorResponse, handlePreflight } from "@/lib/cors";

/**
 * OPTIONS /api/habits/[id]/checkin
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return handlePreflight();
}

/**
 * POST /api/habits/[id]/checkin
 * 
 * Toggles a check-in for a specific date.
 * This mirrors the `toggleCheckInHabitAction` Server Action.
 * 
 * Request body:
 *   - date: string (YYYY-MM-DD format, defaults to today)
 * 
 * Response:
 *   - 200: { success: true, checkInDays: string[], habit: Habit }
 *   - 404: Habit not found
 *   - 500: Server error
 * 
 * Behavior:
 *   - If date is already checked in → removes it (checkout)
 *   - If date is not checked in → adds it (checkin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habitId = parseInt(id, 10);

    if (isNaN(habitId)) {
      return corsErrorResponse("Invalid habit ID", 400);
    }

    // Parse request body
    const body = await request.json();
    
    // Get date from body or use today's date
    const date = body.date || new Date().toISOString().split("T")[0];

    console.log("[API] POST /api/habits/", habitId, "/checkin - Date:", date);

    // Get the current habit
    const [habit] = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.id, habitId));

    if (!habit) {
      console.warn(`[API] Habit with id ${habitId} not found in database`);
      return corsJsonResponse(
        { success: false, error: "Habit not found", checkInDays: [] },
        { status: 404 }
      );
    }

    // Toggle the check-in
    let updatedDays: string[];
    const currentDays = habit.checkInDays ?? [];

    if (currentDays.includes(date)) {
      // Checkout → remove the date
      updatedDays = currentDays.filter((d) => d !== date);
      console.log("[API] Checking out:", date);
    } else {
      // Checkin → add the date
      updatedDays = [...currentDays, date];
      console.log("[API] Checking in:", date);
    }

    // Calculate new streak (same logic as Zustand store)
    const newStreak = computeStreak(updatedDays);
    const highestStreak = Math.max(habit.highestStreak ?? 0, newStreak);

    // Update in database
    const [updatedHabit] = await db
      .update(habitTable)
      .set({ 
        checkInDays: updatedDays,
        highestStreak: highestStreak
      })
      .where(eq(habitTable.id, habitId))
      .returning();

    console.log("[API] Updated check-in days:", updatedDays.length, "Streak:", newStreak);

    return corsJsonResponse({
      success: true,
      checkInDays: updatedDays,
      currentStreak: newStreak,
      highestStreak: highestStreak,
      habit: updatedHabit
    });
  } catch (error) {
    console.error("[API] POST /api/habits/[id]/checkin error:", error);
    return corsErrorResponse("Failed to toggle check-in", 500);
  }
}

/**
 * Compute current streak from array of check-in dates.
 * A streak is consecutive days of check-ins ending at today.
 * 
 * This matches the logic in the Zustand store.
 */
function computeStreak(days: string[]): number {
  if (!days?.length) return 0;

  const set = new Set(days);
  let streak = 0;

  // Check past 365 days starting from today
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];

    if (set.has(iso)) {
      streak++;
    } else {
      break; // Stop at first missing day
    }
  }

  return streak;
}
