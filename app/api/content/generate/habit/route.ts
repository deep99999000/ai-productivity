// ./app/api/content/generate-habits/route.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";


function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey,
    temperature: 0.7,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { habits } = body;

    if (!habits || !Array.isArray(habits)) {
      return Response.json({ error: "Missing or invalid habits array" }, { status: 400 });
    }

    if (habits.length === 0) {
      return Response.json({ error: "Habits array is empty" }, { status: 400 });
    }

    console.log(`[Habit AI] Generating insights for ${habits.length} habits...`);
    
    // Define structured output schema
    const suggestionSchema = z.object({
      type: z.enum(["motivation", "optimization", "health", "social", "analytics", "focus", "efficiency", "learning", "creativity", "resilience", "wellness", "strategy", "leadership"]),
      title: z.string().describe("Very short actionable tip (1-5 words)"),
      description: z.string().describe("First line explains WHY using user's stats, then bullet points with action steps"),
      score: z.number().min(0).max(100),
      actionable: z.boolean(),
      tags: z.array(z.string()).min(2).max(5),
      createdAt: z.string().describe("Date in YYYY-MM-DD format"),
    });

    const outputSchema = z.object({
      insights: z.array(suggestionSchema).min(4).max(7).describe("4-7 actionable insights based on user's habit data")
    });

    const model = initModel().withStructuredOutput(outputSchema);

    const prompt = `You are a professional habit coach AI.
Analyze the user's habits and generate 4-7 actionable insights.

User Habit Data:
${JSON.stringify(habits, null, 2)}

Rules:
- Title: very short actionable tip (1-5 words)
- Description: First line explains WHY this tip is important using user's habit stats, streaks, or gaps. Next lines are bullet points with clear action steps.
- Reference actual data: streaks, missed days, or patterns
- Be professional, motivational, and practical - no generic tips
- Today's date: ${new Date().toISOString().split("T")[0]}`;

    const response = await model.invoke(prompt);

    console.log(`[Habit AI] Successfully generated ${response.insights.length} insights`);
    return Response.json(response.insights);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Habit AI] Error:", message);
    if (error instanceof Error) {
      console.error("[Habit AI] Stack:", error.stack);
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
