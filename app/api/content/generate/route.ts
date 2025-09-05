// ./app/api/content/generate/route.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const allowedStatus = ["Not Started", "In Progress", "Completed"] as const;
const allowedCategories = ["Coding", "Work", "Personal", "Health", "Learning", "Finance"] as const;

function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey,
    temperature: 0.7,
  });
}


// Helper to check if value is a string
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Helper to safely extract content from AI response
function extractContent(response: unknown): string {
  if (!response || typeof response !== "object") return "";
  if ("content" in response) {
    const content = (response as { content?: unknown }).content;
    if (isString(content)) return content;
    if (typeof content === "object" && content !== null) {
      const text = (content as { text?: unknown }).text;
      return isString(text) ? text : "";
    }
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, description } = body;

    if (!name || !type) {
      return Response.json(
        { error: "Missing required fields: type, name" },
        { status: 400 }
      );
    }

    if (!["task", "goals", "subgoals"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Use 'task', 'goals', or 'subgoals'" },
        { status: 400 }
      );
    }

    const model = initModel();

    let systemPrompt = "";

    if (type === "task") {
      systemPrompt = `You are an AI that generates realistic tasks for a given request.
Return exactly 5 tasks in valid JSON only. No markdown, no explanation.
Each task must follow this schema:
{
  "name": string (max 255 chars),
  "description": string (max 2000 chars),
  "isDone": boolean,
  "category": one of ${JSON.stringify(allowedCategories)},
  "priority": one of ["Low", "Medium", "High"],
  "startDate": string (YYYY-MM-DD),
  "endDate": string (YYYY-MM-DD)
}
Rules:
- Ensure JSON is an array of 5 objects.
- Dates must be between today and 1 year from today.
- Each task must have a meaningful description.`;
    } else if (type === "goals") {
      systemPrompt = `You are an AI that generates realistic goals for a given user request.
Return exactly 5 goals in valid JSON only. No markdown, no explanation.
Each goal must follow this schema:
{
  "name": string (max 255 chars),
  "description": string (max 2000 chars),
  "status": one of ${JSON.stringify(allowedStatus)},
  "category": one of ${JSON.stringify(allowedCategories)},
  "endDate": string (YYYY-MM-DD)
}
Rules:
- Ensure JSON is an array of 5 objects.
- Dates must be between today and 1 year from today.
- Each goal must have a meaningful description.`;
    } else if (type === "subgoals") {
      systemPrompt = `You are an AI that generates realistic subgoals for a given goal.
Return exactly 5 subgoals in valid JSON only. No markdown, no explanation.
Each subgoal must follow this schema:
{
  "name": string,
  "description": string,
  "status": "not_started",
  "endDate": string (YYYY-MM-DD),
  "isdone": false
}
Rules:
- Ensure JSON is an array of 5 objects.
- Dates must be between today and 1 year from today.
- Each subgoal must have a meaningful description.`;
    }

    const userPrompt = description
      ? `Generate for: ${name}\nDescription: ${description}`
      : `Generate for: ${name}`;

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // ✅ Safely extract content without `any`
    let rawContent = extractContent(response);

    // Remove markdown code block wrappers
    if (rawContent.startsWith("```")) {
      rawContent = rawContent
        .replace(/^```(json)?/, "")
        .replace(/```$/, "")
        .trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseError) {
      console.log(parseError);
      return Response.json(
        { error: "Failed to parse AI response as JSON", raw: rawContent },
        { status: 500 }
      );
    }

    // Optional: Add basic validation that it's an array of objects
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json(
        { error: "AI response is not a valid array", data: parsed },
        { status: 500 }
      );
    }

    return Response.json(parsed);

  } catch (error) {
    // ✅ Properly typed error handling
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("AI generation error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}