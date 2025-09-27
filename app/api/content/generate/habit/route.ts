// ./app/api/content/generate-habits/route.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey,
    temperature: 0.7,
  });
}

interface AIResponse {
  content?: string | { text?: string };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { habits } = body;

    if (!habits || !Array.isArray(habits)) {
      return Response.json({ error: "Missing or invalid habits array" }, { status: 400 });
    }

    const model = initModel();
const systemPrompt = `
You are a professional habit coach AI.
Analyze the user's habits and generate 4-7 actionable insights.

Rules:
- JSON only, valid syntax.
- Title: very short actionable tip (1-5 words)
- Description:
  1. First line: explain WHY this tip is important using user's habit stats, streaks, or gaps.
  2. Next lines: bullet points with clear action steps.
- Use only dates (YYYY-MM-DD) for createdAt.
- Types: motivation, optimization, health, social, analytics, focus, efficiency, learning, creativity, resilience, wellness, strategy, leadership.
- Score 0-100, actionable true/false
- Tags: 2-5 keywords

Do not use generic tips. Be professional, motivational, and practical.
`;


    const userPrompt = `
User Habit Data:
${JSON.stringify(habits, null, 2)}

Generate **AISuggestions** as a personal habit coach. Each suggestion should reference the user's streaks, missed days, or patterns.`;

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Extract AI content
    let rawContent: string = "";
    if (typeof response === "object" && response !== null && "content" in response) {
      const resp = response as AIResponse;
const c = resp.content;
rawContent = typeof c === "string" ? c : c?.text ?? "";
    }

    // Remove code blocks if present
    rawContent = rawContent.replace(/^```(json)?/, "").replace(/```$/, "").trim();

    // Parse JSON safely
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
        console.log(err);
        
      return Response.json({ error: "Failed to parse AI JSON", raw: rawContent }, { status: 500 });
    }

    // Optional: validate array
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json({ error: "AI response is not a valid array", data: parsed }, { status: 500 });
    }

    return Response.json(parsed);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
