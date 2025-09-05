// ./app/api/content/refine/description/route.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey,
    temperature: 0.6,
  });
}

function extractContent(response: unknown): string {
  if (!response || typeof response !== "object") return "";
  if ("content" in response) {
    const content = (response as { content?: unknown }).content;
    if (typeof content === "string") return content;
    if (typeof content === "object" && content !== null) {
      const text = (content as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    }
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, description } = body;

    if (!description || !type) {
      return Response.json(
        { error: "Missing required fields: type, description" },
        { status: 400 }
      );
    }

    if (!["task", "goal", "subgoal"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Use 'task', 'goal', or 'subgoal'" },
        { status: 400 }
      );
    }

    const model = initModel();

    const systemPrompt = `You are an AI that refines user input into a clear, motivating, and professional description. 
Return valid JSON only:
{
  "refinedDescription": string (max 2000 chars)
}
Rules:
- Do not change meaning.
- Improve clarity, grammar, and impact.
- No markdown, no extra explanation.`;

    const userPrompt = `Refine this ${type} description: "${description}"`;

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    let rawContent = extractContent(response);

    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(rawContent);

    if (!parsed || typeof parsed !== "object" || !("refinedDescription" in parsed)) {
      return Response.json({ error: "Invalid AI response", raw: parsed }, { status: 500 });
    }

    return Response.json(parsed);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("AI refine description error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
