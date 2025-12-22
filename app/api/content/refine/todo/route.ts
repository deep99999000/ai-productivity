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
    const { content, selectedText, context, todoName } = body;

    const textToRefine = selectedText || content;
    
    if (!textToRefine) {
      return Response.json({ error: "Missing content to refine" }, { status: 400 });
    }

    console.log(`[Todo AI] Refining ${selectedText ? "selected text" : "content"} for: ${todoName || "unnamed todo"}`);

    // Define structured output schema
    const refinedContentSchema = z.object({
      content: z.string().describe("Refined HTML content - keep it concise and actionable"),
      improvements: z.array(z.string()).min(1).max(3).describe("Key improvements made"),
    });

    const prompt = `You are a productivity assistant refining ${selectedText ? "selected text" : "a task description"}.

Task: ${todoName || "Task"}
${selectedText ? `Selected Text: ${selectedText}` : `Full Content: ${content}`}
${context ? `Context: Priority=${context.priority}` : ""}

Your task: Improve the text to be clearer and more actionable.

Guidelines:
- Keep it CONCISE - this is a daily task, not a project plan
- Make language clear and actionable
- Fix grammar and structure
- Use simple formatting:
  * <p>...</p> for paragraphs
  * <ul><li>...</li></ul> for lists
  * <strong>...</strong> for emphasis
  * <ul data-type="taskList"><li data-type="taskItem" data-checked="false">...</li></ul> ONLY if there are clear sub-steps
- ${selectedText ? "Refine ONLY the selected portion while maintaining context" : "Improve the overall description"}
- Don't add unnecessary complexity or length
- Keep the core meaning intact

Return clean, improved HTML.`;

    let response: z.infer<typeof refinedContentSchema>;
    let modelUsed: string;

    // Try Gemini first
    try {
      console.log("[Todo AI] Trying Gemini for refinement...");
      const model = initModel().withStructuredOutput(refinedContentSchema);
      response = await model.invoke(prompt);
      modelUsed = "Gemini (2.5-flash)";
      console.log(`[Todo AI] ✓ Gemini success`);
    } catch (geminiError) {
      console.error("[Todo AI] Gemini failed:", geminiError instanceof Error ? geminiError.message : "Unknown error");
      throw geminiError;
    }

    console.log(`[Todo AI] Successfully refined content using ${modelUsed}`);
    return Response.json(response);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Todo AI] Refine error:", message);
    if (error instanceof Error) {
      console.error("[Todo AI] Stack:", error.stack);
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
