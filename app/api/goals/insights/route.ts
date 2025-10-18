import type { Goal } from "@/features/goals/types";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey,
    temperature: 0.6,
  });
}

interface AIResponseShape {
  completionProbability: number; // 0-100
  estimatedCompletionDate: string; // YYYY-MM-DD
  riskFactors: string[];
  bottlenecks: string[];
  suggestionImprovements: string[];
  recommendations: Array<{
    id?: string;
    type: "optimization" | "risk" | "opportunity" | "automation";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    effort: "quick" | "medium" | "complex";
    confidence: number; // 0-100
    actionable: boolean;
    automatable?: boolean;
    estimatedTimeToImplement: string;
    relatedGoalIds?: number[];
    createdAt?: string; // YYYY-MM-DD
  }>;
}

function extractContent(response: unknown): string {
  if (!response || typeof response !== "object") return "";
  if ("content" in response) {
    const c = (response).content;
    if (typeof c === "string") return c;
    if (c && typeof c === "object" && "text" in c && typeof c.text === "string") return c.text;
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal, subgoals, todos } = body as {
      goal: Goal;
      subgoals: Subgoal[];
      todos: Todo[];
    };

    if (!goal || typeof goal !== "object") {
      return Response.json({ error: "Missing goal" }, { status: 400 });
    }

    const model = initModel();

    const systemPrompt = `You are an expert productivity coach and data analyst. Analyze the goal data and return ONLY JSON with this exact schema:

{
  "completionProbability": number (0-100, integer based on current progress, velocity, and timeline),
  "estimatedCompletionDate": "YYYY-MM-DD" (realistic prediction based on current pace),
  "riskFactors": string[] (specific risks with percentages and dates when possible),
  "bottlenecks": string[] (concrete blockers and delays affecting progress),
  "suggestionImprovements": string[] (actionable 1-2 sentence improvements),
  "recommendations": [
    {
      "id": string (unique identifier),
      "type": "optimization" | "risk" | "opportunity" | "automation",
      "title": string (clear, actionable title, 3-8 words),
      "description": string (detailed explanation with specific steps and expected outcomes, 3-5 sentences with concrete actions),
      "impact": "high" | "medium" | "low",
      "effort": "quick" | "medium" | "complex",
      "confidence": number (0-100, your confidence in this recommendation),
      "actionable": boolean (can user act on this immediately),
      "automatable": boolean | null (can this be automated),
      "estimatedTimeToImplement": string (realistic time estimate),
      "relatedGoalIds": number[],
      "createdAt": "YYYY-MM-DD"
    }
  ]
}

ANALYSIS REQUIREMENTS:
1. Calculate completion probability based on:
   - Current progress rate (completed vs total tasks)
   - Time remaining vs work remaining
   - Task complexity and dependencies
   - Historical velocity patterns

2. Identify specific risks like:
   - "Timeline risk: 15 tasks remaining with only 8 days left"
   - "Dependency risk: 3 high-priority tasks blocked by X"
   - "Resource risk: No tasks completed in last 7 days"

3. Generate 2-5 smart recommendations that:
   - Address the biggest bottlenecks
   - Optimize timeline and priorities
   - Suggest automation opportunities
   - Provide specific next steps

4. Use actual data from the goal:
   - Reference specific task names, dates, counts
   - Calculate real percentages and metrics
   - Mention actual deadlines and progress

Return valid JSON only. Be specific, data-driven, and actionable.`;

    const todayStr = new Date().toISOString().slice(0, 10);

    const userPrompt = `GOAL ANALYSIS REQUEST:

Goal: "${goal.name}"
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

Recent Tasks (last 7 days):
${todos.filter(t => t.endDate && new Date(t.endDate) > new Date(Date.now() - 7*24*60*60*1000))
  .map(t => `- "${t.name}" (${t.isDone ? 'Done' : 'Pending'}, ${t.priority || 'normal'} priority)`)
  .slice(0, 5).join('\n')}

ANALYSIS FOCUS:
- Calculate realistic completion probability based on current velocity
- Identify specific timeline and resource risks
- Suggest concrete optimization strategies
- Provide actionable next steps

Return the JSON analysis now.`;

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    let raw = extractContent(response).trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.log(e);
      
      return Response.json({ error: "Failed to parse AI JSON", raw }, { status: 500 });
    }

    // Basic shape sanitization
    const data = parsed as Partial<AIResponseShape>;

    const sanitized: AIResponseShape = {
      completionProbability: Math.max(0, Math.min(100, Math.round(Number(data.completionProbability ?? 0)))),
      estimatedCompletionDate: (data.estimatedCompletionDate && typeof data.estimatedCompletionDate === "string")
        ? data.estimatedCompletionDate
        : todayStr,
      riskFactors: Array.isArray(data.riskFactors) ? data.riskFactors.filter((x) => typeof x === "string") : [],
      bottlenecks: Array.isArray(data.bottlenecks) ? data.bottlenecks.filter((x) => typeof x === "string") : [],
      suggestionImprovements: Array.isArray(data.suggestionImprovements)
        ? data.suggestionImprovements.filter((x) => typeof x === "string")
        : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations.map((r, idx) => {
        const id = r.id || `rec-${idx}-${Date.now()}`;
        const createdAt = r.createdAt && typeof r.createdAt === "string" ? r.createdAt : todayStr;
        return {
          id,
          type: (r.type) ?? "optimization",
          title: String(r.title ?? "Recommendation"),
          description: String(r.description ?? ""),
          impact: (r.impact) ?? "medium",
          effort: (r.effort) ?? "medium",
          confidence: Math.max(0, Math.min(100, Math.round(Number(r.confidence ?? 70)))),
          actionable: Boolean(r.actionable ?? true),
          automatable: typeof r.automatable === "boolean" ? r.automatable : undefined,
          estimatedTimeToImplement: String(r.estimatedTimeToImplement ?? "1-3 hours"),
          relatedGoalIds: Array.isArray(r.relatedGoalIds) ? r.relatedGoalIds : [Number(goal.id)].filter(Boolean),
          createdAt,
        };
      }) : [],
    };

    return Response.json(sanitized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Goal Smart Insights error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
