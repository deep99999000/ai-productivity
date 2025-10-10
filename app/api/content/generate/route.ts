// ./app/api/content/generate/route.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const allowedStatus = ["Not Started", "In Progress", "Completed"] as const;
const allowedCategories = ["Coding", "Work", "Personal", "Health", "Learning", "Finance"] as const;

function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
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
    const { type, name, description, context } = body;

    if (!name || !type) {
      return Response.json(
        { error: "Missing required fields: type, name" },
        { status: 400 }
      );
    }

    if (!["task", "goals", "subgoals", "habits"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Use 'task', 'goals', 'subgoals', or 'habits'" },
        { status: 400 }
      );
    }

    const model = initModel();

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate future dates
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
 
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
   
    let systemPrompt = "";

    if (type === "task") {
      systemPrompt = `You are an expert productivity AI that generates highly actionable, specific tasks.
Context awareness: You have access to the user's subgoal/goal information to make relevant suggestions.

Return exactly 5 tasks in valid JSON only. No markdown, no explanation.
Each task must follow this schema:
{
  "name": string (max 255 chars, specific and actionable),
  "description": string (max 2000 chars, detailed with clear steps),
  "isDone": false,
  "category": one of ${JSON.stringify(allowedCategories)},
  "priority": one of ["low", "medium", "high"],
  "startDate": string (YYYY-MM-DD format, default to today: ${todayStr}),
  "endDate": string (YYYY-MM-DD format, should be after startDate)
}

DATE REQUIREMENTS:
- startDate should default to today (${todayStr}) for all tasks
- endDate should be realistic based on task complexity:
  * Simple tasks: 1-3 days from start
  * Medium tasks: 3-7 days from start  
  * Complex tasks: 7-14 days from start
- Ensure endDate is always after startDate
- Use YYYY-MM-DD format only

QUALITY REQUIREMENTS:
1. Tasks must be SPECIFIC and ACTIONABLE (e.g., "Research 5 React UI libraries" not "Research libraries")
2. Descriptions must include clear steps, expected outcomes, and time estimates
3. Prioritize based on dependencies and impact (high = critical path, medium = important, low = nice-to-have)
4. Set realistic deadlines considering complexity and dependencies
5. Include estimated time commitments in descriptions
6. Consider prerequisite tasks and logical sequencing
7. Make tasks measurable with clear completion criteria

CONTEXT INTEGRATION:
- Use provided subgoal/goal context to ensure relevance
- Consider user's constraints and preferences
- Suggest efficient workflows and best practices
- Include relevant tools, resources, or methodologies

Rules:
- Ensure JSON is an array of 5 objects
- All dates must be in YYYY-MM-DD format
- startDate defaults to today for all tasks
- Each task must have detailed, helpful descriptions with actionable steps
- Vary priority levels based on actual importance and dependencies`;
    } else if (type === "goals") {
      systemPrompt = `You are an AI that generates realistic, SMART goals for a given user request.
Return exactly 5 goals in valid JSON only. No markdown, no explanation.
Each goal must follow this schema:
{
  "name": string (max 255 chars, specific and measurable),
  "description": string (max 2000 chars, detailed with success criteria),
  "status": one of ${JSON.stringify(allowedStatus)},
  "category": one of ${JSON.stringify(allowedCategories)},
  "endDate": string (YYYY-MM-DD)
}
Rules:
- Goals must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Include clear success metrics and milestones in descriptions
- Dates must be between today and 1 year from today
- Each goal must have meaningful, detailed descriptions with clear outcomes`;
    } else if (type === "subgoals") {
      systemPrompt = `You are an expert goal strategist AI that generates realistic, progressive subgoals for achieving complex objectives.

Return exactly 5 subgoals in valid JSON only. No markdown, no explanation.
Each subgoal must follow this schema:
{
  "name": string (clear milestone, max 255 chars),
  "description": string (detailed deliverables and success criteria, max 2000 chars),
  "status": "not_started",
  "endDate": string (YYYY-MM-DD),
  "isdone": false
}

DATE REQUIREMENTS:
- endDate should be progressive and realistic
- First subgoal: 2-4 weeks from today (${todayStr})
- Subsequent subgoals: logically spaced 2-6 weeks apart
- Final subgoal: within reasonable timeframe (3-12 months)
- Consider dependencies and complexity for timing

QUALITY REQUIREMENTS:
1. Subgoals must be SPECIFIC milestones (e.g., "Complete user authentication system" not "Work on backend")
2. Each subgoal must be a meaningful step toward the main goal
3. Include measurable outcomes and clear deliverables in descriptions
4. Ensure logical progression and dependencies
5. Make each subgoal substantial enough to be meaningful but achievable
6. Consider prerequisite knowledge, tools, and resources needed
7. Include specific success criteria and completion indicators

PROGRESSION STRATEGY:
- Foundation/Research phase → Planning/Design phase → Development/Build phase → Testing/Refinement phase → Launch/Deploy phase
- Each subgoal should unlock the next logical step
- Consider skills development, tool setup, and incremental building
- Include validation and feedback loops where appropriate

DESCRIPTION GUIDELINES:
- Start with clear deliverable: "Create X that does Y"
- Include specific components, features, or outcomes
- Mention tools, technologies, or methodologies to use
- Define success criteria and acceptance requirements
- Estimate time commitment and effort level
- Include any prerequisites or dependencies

Rules:
- Ensure JSON is an array of 5 objects
- All dates must be in YYYY-MM-DD format and progressive
- Each subgoal must build meaningfully toward the parent goal
- Descriptions must be detailed and actionable (100+ characters)
- Focus on concrete deliverables rather than abstract concepts`;
    } else if (type === "habits") {
      systemPrompt = `You are an expert habit coach AI.
Generate exactly 5 HIGH-QUALITY habit suggestions based on the user's theme.
Return ONLY valid JSON (array of 5 objects) – no markdown, no commentary.
Each habit object MUST follow exactly this schema:
{
  "name": string (2-5 words, actionable, specific, NO numbering, NO quotes),
  "emoji": string (single relevant emoji, no text, no duplicates)
}
Guidelines:
- Names must be specific (e.g. "Morning Stretch", not "5-Minute Mobility Flow")
- Avoid generic verbs alone (good: "Meditate", bad: "Practice Mindfulness")
- No punctuation except hyphen if needed
- No duplicates or near-duplicates
- Pick varied focus angles (energy, focus, recovery, learning, wellness, discipline)
- Emojis must match the habit concept and all be different
Return ONLY JSON.`;
    }

    // Enhanced user prompt with context
    let userPrompt = description
      ? `Generate for: ${name}\nDescription: ${description}`
      : `Generate for: ${name}`;

    if (context) {
      userPrompt += `\n\nContext:`;
      if (context.subgoalName) userPrompt += `\n- Subgoal: ${context.subgoalName}`;
      if (context.goalId) userPrompt += `\n- Goal ID: ${context.goalId}`;
      if (context.hasTimeConstraints) userPrompt += `\n- Consider time constraints and realistic scheduling`;
      if (context.priorityFocus) userPrompt += `\n- Priority focus: ${context.priorityFocus}`;
      if (context.detailLevel === "comprehensive") userPrompt += `\n- Provide comprehensive, detailed suggestions with clear steps`;
    }

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

    // Post-process the tasks to ensure proper date formatting and defaults
    if (type === "task") {
      const processedTasks = parsed.map((task, index: number) => {
        // Ensure startDate defaults to today
        if (!task.startDate) {
          task.startDate = todayStr;
        }
        
        // Ensure endDate is valid and after startDate
        if (!task.endDate || typeof task.endDate !== 'string') {
          const startDate = new Date(task.startDate);
          const defaultEndDate = new Date(startDate);
          // Stagger end dates: 2, 4, 6, 8, 10 days from start
          defaultEndDate.setDate(defaultEndDate.getDate() + (index + 1) * 2);
          task.endDate = defaultEndDate.toISOString().split('T')[0];
        }
        
        // Ensure isDone is boolean false
        task.isDone = false;
        
        // Ensure category is set
        if (!task.category) {
          task.category = "General";
        }
        
        return task;
      });
      
      return Response.json(processedTasks);
    } else if (type === "subgoals") {
      const processedSubgoals = parsed.map((subgoal, index: number) => {
        // Ensure endDate is progressive and realistic
        if (!subgoal.endDate || typeof subgoal.endDate !== 'string') {
          const defaultEndDate = new Date(today);
          // Progressive dates: 2, 4, 8, 12, 16 weeks from today
          const weeksToAdd = [2, 4, 8, 12, 16][index] || (index + 1) * 4;
          defaultEndDate.setDate(defaultEndDate.getDate() + weeksToAdd * 7);
          subgoal.endDate = defaultEndDate.toISOString().split('T')[0];
        }
        
        // Ensure status and isdone are correct
        subgoal.status = "not_started";
        subgoal.isdone = false;
        
        return subgoal;
      });
      
      return Response.json(processedSubgoals);
    }

    return Response.json(parsed);

  } catch (error) {
    // ✅ Properly typed error handling
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("AI generation error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}