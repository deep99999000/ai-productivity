import type { Goal } from "@/features/goals/types";
import type { Subgoal } from "@/features/subGoals/schema";
import type { Todo } from "@/features/todo/schema";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

// Define Zod schema for structured output
const recommendationSchema = z.object({
  id: z.string().describe("Unique identifier"),
  type: z.enum(["optimization", "risk", "opportunity", "automation"]),
  title: z.string().describe("Clear, actionable title (3-8 words)"),
  description: z.string().describe("Detailed explanation with specific steps (3-5 sentences)"),
  impact: z.enum(["high", "medium", "low"]),
  effort: z.enum(["quick", "medium", "complex"]),
  confidence: z.number().min(0).max(100).describe("Confidence in this recommendation"),
  actionable: z.boolean().describe("Can user act on this immediately"),
  automatable: z.boolean().optional().describe("Can this be automated"),
  estimatedTimeToImplement: z.string().describe("Realistic time estimate"),
  relatedGoalIds: z.array(z.number()),
  createdAt: z.string().describe("Date in YYYY-MM-DD format"),
});

const insightsSchema = z.object({
  completionProbability: z.number().min(0).max(100).describe("Integer based on progress, velocity, and timeline"),
  estimatedCompletionDate: z.string().describe("Realistic prediction in YYYY-MM-DD format"),
  riskFactors: z.array(z.string()).describe("Specific risks with percentages and dates"),
  bottlenecks: z.array(z.string()).describe("Concrete blockers affecting progress"),
  suggestionImprovements: z.array(z.string()).describe("Actionable 1-2 sentence improvements"),
  recommendations: z.array(recommendationSchema).min(2).max(5).describe("2-5 smart recommendations"),
});

// 🤖 Initialize AI model
function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey,
    temperature: 0.6,
  });
}

// 📤 POST - Generate AI insights for a goal
export async function POST(req: Request) {
  try {
    // 📥 Parse request body
    const body = await req.json();
    const { goal, subgoals, todos } = body as {
      goal: Goal;
      subgoals: Subgoal[];
      todos: Todo[];
    };

    // ✅ Validate input
    if (!goal || typeof goal !== "object") {
      return Response.json({ error: "Missing goal" }, { status: 400 });
    }

    // 🤖 Initialize AI model with structured output
    const model = initModel().withStructuredOutput(insightsSchema);

    const todayStr = new Date().toISOString().slice(0, 10);

    const prompt = `You are an expert productivity coach and data analyst. Analyze this goal data and provide insights.

GOAL: "${goal.name}"
Description: ${goal.description || "No description"}
Status: ${goal.status}
Deadline: ${goal.endDate ? new Date(goal.endDate).toLocaleDateString() : "No deadline"}
Category: ${goal.category || "General"}

SUBGOALS (${subgoals.length} total):
${subgoals.map(sg => 
  `- "${sg.name}" (${sg.status}, due: ${sg.endDate ? new Date(sg.endDate).toLocaleDateString() : "No date"})`
).join('\n')}

TASKS (${todos.length} total):
Completed: ${todos.filter(t => t.isDone).length}
In Progress: ${todos.filter(t => !t.isDone && t.startDate).length}
Not Started: ${todos.filter(t => !t.isDone && !t.startDate).length}
High Priority: ${todos.filter(t => t.priority === 'high').length}
Overdue: ${todos.filter(t => !t.isDone && t.endDate && new Date(t.endDate) < new Date()).length}

Recent Tasks:
${todos.filter(t => t.endDate && new Date(t.endDate) > new Date(Date.now() - 7*24*60*60*1000))
  .map(t => `- "${t.name}" (${t.isDone ? 'Done' : 'Pending'}, ${t.priority || 'normal'} priority)`)
  .slice(0, 5).join('\n')}

ANALYSIS REQUIREMENTS:
1. Calculate completion probability based on current progress rate, time remaining, and task complexity
2. Identify specific risks (e.g., "15 tasks remaining with only 8 days left")
3. Generate 2-5 smart recommendations that address bottlenecks and optimize timeline
4. Use actual data - reference specific tasks, dates, counts, and percentages
5. Set createdAt to: ${todayStr}
6. Set relatedGoalIds to: [${goal.id}]

Be specific, data-driven, and actionable.`;

    const response = await model.invoke(prompt);

    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Goal Smart Insights error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
