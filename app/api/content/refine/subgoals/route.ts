// ./app/api/content/refine/subgoals/route.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey,
    temperature: 0.5,
  });
}

// Helper to safely extract content from AI response
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
    const { subgoals, feedback, context } = body;

    if (!subgoals || !Array.isArray(subgoals)) {
      return Response.json(
        { error: "Missing or invalid subgoals array" },
        { status: 400 }
      );
    }

    const model = initModel();

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate dates for next month and year
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const systemPrompt = `You are an expert goal-setting AI that refines and improves subgoal suggestions based on user feedback.

Your job is to analyze the provided subgoals and user feedback, then return improved versions.

Return exactly the same number of subgoals in valid JSON only. No markdown, no explanation.
Each refined subgoal must follow this schema:
{
  "name": string (clear milestone, max 255 chars),
  "description": string (detailed deliverables and success criteria, max 2000 chars),
  "status": "not_started",
  "endDate": string (YYYY-MM-DD format),
  "isdone": false,
  "tempId": number (preserve original tempId)
}

DATE REQUIREMENTS:
- endDate should be realistic and progressive (each subgoal building toward the main goal)
- Dates should be between today (${todayStr}) and one year from now
- Consider logical sequencing - earlier subgoals should have earlier dates
- Use YYYY-MM-DD format only

REFINEMENT GUIDELINES:
1. Address the user's specific feedback and concerns
2. Make subgoals more specific, measurable, and achievable
3. Improve descriptions with clear deliverables and success criteria
4. Ensure logical progression toward the parent goal
5. Set realistic and progressive deadlines
6. Add relevant details about expected outcomes and milestones
7. Ensure each subgoal builds meaningfully toward the main objective

QUALITY IMPROVEMENTS:
- Make vague subgoals more specific and measurable
- Add clear success criteria and deliverables
- Include milestone markers and progress indicators
- Suggest practical approaches and methodologies
- Provide realistic timeframes for completion
- Clarify expected outcomes and acceptance criteria
- Ensure logical dependencies and sequencing

Rules:
- Preserve the original tempId for each subgoal
- Ensure JSON is a valid array of subgoal objects
- Maintain the same subgoal count as input
- All dates must be in YYYY-MM-DD format
- All subgoals must have status "not_started" and isdone false
- Each subgoal must be a meaningful step toward the parent goal`;

    let userPrompt = `Original subgoals:\n${JSON.stringify(subgoals, null, 2)}`;
    
    if (feedback) {
      userPrompt += `\n\nUser feedback: ${feedback}`;
    }

    if (context) {
      userPrompt += `\n\nContext:`;
      if (context.goalName) userPrompt += `\n- Parent Goal: ${context.goalName}`;
      if (context.goalId) userPrompt += `\n- Goal ID: ${context.goalId}`;
      if (context.preferences) userPrompt += `\n- User preferences: ${context.preferences}`;
      if (context.constraints) userPrompt += `\n- Constraints: ${context.constraints}`;
      if (context.timeframe) userPrompt += `\n- Timeframe: ${context.timeframe}`;
    }

    userPrompt += `\n\nRefine these subgoals to be more specific, measurable, and well-structured based on the feedback and context provided. Ensure they form a logical progression toward achieving the parent goal.`;

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

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

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json(
        { error: "AI response is not a valid array", data: parsed },
        { status: 500 }
      );
    }

    // Post-process the subgoals to ensure proper formatting
    const processedSubgoals = parsed.map((subgoal, index) => {
      // Ensure endDate is valid and in the future
      if (!subgoal.endDate || typeof subgoal.endDate !== 'string') {
        const defaultEndDate = new Date(today);
        // Stagger end dates: 2, 4, 6, 8, 10 weeks from today
        defaultEndDate.setDate(defaultEndDate.getDate() + (index + 1) * 14);
        subgoal.endDate = defaultEndDate.toISOString().split('T')[0];
      }
      
      // Ensure status and isdone are correct
      subgoal.status = "not_started";
      subgoal.isdone = false;
      
      return subgoal;
    });

    return Response.json(processedSubgoals);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("AI subgoal refinement error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
