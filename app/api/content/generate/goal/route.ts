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
    const { goals, subgoals, todos, context } = body;

    if (!goals || !Array.isArray(goals)) {
      return Response.json({ error: "Missing or invalid goals array" }, { status: 400 });
    }

    const model = initModel();

    const systemPrompt = `
You are a professional productivity and goal achievement AI coach.
Analyze the user's goals, sub-goals, and tasks to generate 4-8 actionable insights.

RULES:
- Return ONLY valid JSON array
- Title: actionable tip (1-6 words)
- Description:
  1. First paragraph: explain WHY this insight is important based on user's actual data (goals, sub-goals, tasks, completion rates, deadlines)
  2. Following paragraphs: bullet points with specific action steps
- Use only dates (YYYY-MM-DD) for createdAt
- Types: progress, timeline, optimization, motivation, prioritization, strategy, collaboration, resources, efficiency, learning, analytics, planning, risk, execution
- Score 0-100 (confidence level)
- Priority: low, medium, high (based on impact and urgency)
- Actionable: true/false
- Tags: 2-5 relevant keywords
- estimatedTimeToComplete: realistic time estimate

FOCUS AREAS:
- Identify goals at risk of missing deadlines
- Suggest timeline optimizations
- Point out resource gaps or dependencies
- Recommend priority adjustments
- Motivational insights based on progress patterns
- Efficiency improvements
- Risk mitigation strategies

Be specific, data-driven, and professional. Reference actual goal names, completion percentages, and patterns.
`;

    const userPrompt = `
User Goal Data:
${JSON.stringify({ goals, subgoals, todos, context }, null, 2)}

Generate **GoalAISuggestions** as a professional productivity coach. Each suggestion should reference specific goals, completion rates, deadlines, or task patterns from the user's data.`;

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
      console.log("Parse error:", err);
      return Response.json({ error: "Failed to parse AI JSON", raw: rawContent }, { status: 500 });
    }

    // Optional: validate array
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json({ error: "AI response is not a valid array", data: parsed }, { status: 500 });
    }

    return Response.json(parsed);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Goal insights generation error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}