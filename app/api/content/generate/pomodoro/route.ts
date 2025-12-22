import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import {
  getAllTasks,
  getAllSessions,
  getCompletionStats,
  getDailyTrends,
  getMostProductiveTasks,
} from "@/features/pomodoro/agent-tools";

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
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log(`[Pomodoro AI] Analyzing data for user: ${userId}`);
    
    // Gather all data upfront (efficient batch query)
    const [tasks, sessions, stats, trends, topTasks] = await Promise.all([
      getAllTasks(userId),
      getAllSessions(userId, 7),
      getCompletionStats(userId, 7),
      getDailyTrends(userId, 7),
      getMostProductiveTasks(userId, 3),
    ]);

    console.log(`[Pomodoro AI] Data: ${tasks.length} tasks, ${sessions.length} sessions`);

    // If no data, return starter insight
    if (tasks.length === 0 && sessions.length === 0) {
      return Response.json([{
        type: "motivation",
        title: "Get Started",
        description: "Start tracking your productivity with Pomodoro sessions.\n\n• Create your first task\n• Start a focus session\n• Build your productivity habit",
        score: 100,
        actionable: true,
        tags: ["getting-started", "motivation"],
        createdAt: new Date().toISOString().split("T")[0],
      }]);
    }

    // Define structured output schema
    const suggestionSchema = z.object({
      type: z.enum(["productivity", "focus", "timeManagement", "breakManagement", "taskPlanning", "efficiency", "analytics", "motivation", "energy", "balance", "consistency", "optimization"]),
      title: z.string().describe("Very short actionable tip (1-5 words)"),
      description: z.string().describe("First line explains WHY using user's actual stats, then bullet points with action steps"),
      score: z.number().min(0).max(100),
      actionable: z.boolean(),
      tags: z.array(z.string()).min(2).max(5),
      createdAt: z.string().describe("Date in YYYY-MM-DD format"),
    });

    const outputSchema = z.object({
      insights: z.array(suggestionSchema).length(5).describe("Exactly 5 personalized insights based on user's pomodoro data")
    });

    const prompt = `You are a professional productivity coach AI specializing in Pomodoro technique.
Analyze the user's pomodoro data and generate exactly 5 actionable insights.

User Pomodoro Data:
- Tasks: ${tasks.length} (Top: ${topTasks.map(t => t.taskName).join(", ")})
- Sessions (7 days): ${sessions.length} total
- Completed Sessions: ${stats.completedSessions}
- Completion Rate: ${sessions.length > 0 ? Math.round((Number(stats.completedSessions) / sessions.length) * 100) : 0}%
- Total Focus Time: ${Math.round(Number(stats.totalDuration) / 60)} minutes
- Active Days: ${trends.length}
- Average Duration: ${stats.averageDuration ? Math.round(Number(stats.averageDuration)) : 0} minutes

Rules:
- Title: very short actionable tip (1-5 words)
- Description: First line explains WHY using user's actual stats, completion rates, or patterns. Next lines are bullet points with clear action steps.
- Reference actual data - no generic tips
- Be professional, motivational, and practical
- Today's date: ${new Date().toISOString().split("T")[0]}`;

    let response: z.infer<typeof outputSchema>;
    let modelUsed: string;

    // Try Gemini first
    try {
      console.log("[Pomodoro AI] Trying Gemini...");
      const model = initModel().withStructuredOutput(outputSchema);
      response = await model.invoke(prompt);
      modelUsed = "Gemini (2.5-flash-lite)";
      console.log(`[Pomodoro AI] ✓ Gemini success`);
    } catch (geminiError) {
      console.error("[Pomodoro AI] Gemini failed:", geminiError instanceof Error ? geminiError.message : "Unknown error");
      throw geminiError;
    }

    console.log(`[Pomodoro AI] Successfully generated ${response.insights.length} insights using ${modelUsed}`);
    return Response.json(response.insights);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Pomodoro AI] Error:", message);
    if (error instanceof Error) {
      console.error("[Pomodoro AI] Stack:", error.stack);
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
