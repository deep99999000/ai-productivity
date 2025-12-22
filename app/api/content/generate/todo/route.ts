import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

function initModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("❌ GOOGLE_API_KEY is missing in .env");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey,
    temperature: 0.7,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { todoName, currentDescription, context } = body;

    if (!todoName) {
      return Response.json({ error: "Missing todoName" }, { status: 400 });
    }

    console.log(`[Todo AI] Generating content for: ${todoName}`);

    // Define structured output schema
    const generatedContentSchema = z.object({
      content: z.string().describe("Simple, actionable HTML content - keep it concise for daily tasks"),
      summary: z.string().describe("Brief summary of what was generated"),
    });

    const systemPrompt = `You are a productivity assistant helping with daily task planning.

Task: ${todoName}
${currentDescription ? `Current Description: ${currentDescription}` : ""}
${context ? `Context: Priority=${context.priority}, Category=${context.category}` : ""}

Generate a description suitable for a daily task/notes.
Guidelines:
- Keep it short and actionable (2-4 sentences or a few bullet points)
- Use simple HTML formatting:
  * <p>Simple paragraph</p> for basic text
  * <ul><li>Item</li></ul> for short lists (2-4 items max)
  * <strong>text</strong> only for critical emphasis
  * ONLY add checkboxes <ul data-type="taskList"><li data-type="taskItem" data-checked="false">...</li></ul> if there are clear sub-steps
- Focus on WHAT needs to be done and WHY it matters
- Keep it practical and to-the-point

Example good output:
<p>Review and respond to pending customer emails from this week. Focus on urgent requests first.</p>

OR with simple checklist:
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">Check inbox for urgent items</li>
  <li data-type="taskItem" data-checked="false">Draft responses</li>
  <li data-type="taskItem" data-checked="false">Send replies</li>
</ul>`;

    let response: z.infer<typeof generatedContentSchema>;
    let modelUsed: string;

    // Try Gemini first
    try {
      console.log("[Todo AI] Trying Gemini for generation...");
      const model = initModel().withStructuredOutput(generatedContentSchema);
      response = await model.invoke(systemPrompt);
      modelUsed = "Gemini (2.5-flash)";
      console.log(`[Todo AI] ✓ Gemini success`);
    } catch (geminiError) {
      console.error("[Todo AI] Gemini failed:", geminiError instanceof Error ? geminiError.message : "Unknown error");
      throw geminiError;
    }

    console.log(`[Todo AI] Successfully generated content using ${modelUsed}`);
    return Response.json(response);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Todo AI] Generate error:", message);
    if (error instanceof Error) {
      console.error("[Todo AI] Stack:", error.stack);
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
