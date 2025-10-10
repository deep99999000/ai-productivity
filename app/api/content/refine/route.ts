// ./app/api/content/refine/route.ts
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
    const { tasks, feedback, context } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return Response.json(
        { error: "Missing or invalid tasks array" },
        { status: 400 }
      );
    }

    const model = initModel();

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate dates for next week
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
   
    const systemPrompt = `You are an expert productivity AI that refines and improves task suggestions based on user feedback.

Your job is to analyze the provided tasks and user feedback, then return improved versions.

Return exactly the same number of tasks in valid JSON only. No markdown, no explanation.
Each refined task must follow this schema:
{
  "name": string (max 255 chars, specific and actionable),
  "description": string (max 2000 chars, detailed with clear steps),
  "isDone": false,
  "category": string,
  "priority": one of ["low", "medium", "high"],
  "startDate": string (YYYY-MM-DD format, default to today: ${todayStr}),
  "endDate": string (YYYY-MM-DD format, should be after startDate),
  "tempId": number (preserve original tempId)
}

DATE REQUIREMENTS:
- startDate should default to today (${todayStr}) if not provided or invalid
- endDate should be realistic based on task complexity (1-14 days from start)
- Ensure endDate is always after startDate
- Use YYYY-MM-DD format only

REFINEMENT GUIDELINES:
1. Address the user's specific feedback and concerns
2. Make tasks more specific, actionable, and measurable
3. Improve descriptions with clearer steps and expected outcomes
4. Adjust priorities based on dependencies and user preferences
5. Set realistic start and end dates
6. Add relevant details like time estimates, tools, or resources needed
7. Ensure logical task sequencing and dependencies

QUALITY IMPROVEMENTS:
- Make vague tasks more specific and actionable
- Add measurable outcomes and success criteria
- Include practical steps and methodologies
- Suggest efficient tools and resources
- Provide realistic time estimates
- Clarify deliverables and acceptance criteria

Rules:
- Preserve the original tempId for each task
- Ensure JSON is a valid array of task objects
- Maintain the same task count as input
- All dates must be in YYYY-MM-DD format
- startDate defaults to today if missing
- endDate must be after startDate`;

    let userPrompt = `Original tasks:\n${JSON.stringify(tasks, null, 2)}`;
    
    if (feedback) {
      userPrompt += `\n\nUser feedback: ${feedback}`;
    }

    if (context) {
      userPrompt += `\n\nContext:`;
      if (context.subgoalName) userPrompt += `\n- Subgoal: ${context.subgoalName}`;
      if (context.goalId) userPrompt += `\n- Goal ID: ${context.goalId}`;
      if (context.preferences) userPrompt += `\n- User preferences: ${context.preferences}`;
      if (context.constraints) userPrompt += `\n- Constraints: ${context.constraints}`;
    }

    userPrompt += `\n\nRefine these tasks to be more actionable, specific, and well-structured based on the feedback and context provided.`;

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

    // Post-process the tasks to ensure proper date formatting
    const processedTasks = parsed.map((task) => {
      // Ensure startDate defaults to today if missing
      if (!task.startDate ) {
        task.startDate = todayStr;
      }
      
      // Ensure endDate is valid and after startDate
      if (!task.endDate || typeof task.endDate !== 'string') {
        const startDate = new Date(task.startDate);
        const defaultEndDate = new Date(startDate);
        defaultEndDate.setDate(defaultEndDate.getDate() + 3); // Default 3 days
        task.endDate = defaultEndDate.toISOString().split('T')[0];
      }
      
      // Ensure isDone is boolean
      task.isDone = false;
      
      return task;
    });

    return Response.json(processedTasks);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("AI refinement error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
