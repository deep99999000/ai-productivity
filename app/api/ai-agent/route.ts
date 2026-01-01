import { askAgent, clearHistory } from "@/lib/ai/agent";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { message, sessionId } = await request.json();
  const userId = session.user.id;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Progress callback that sends updates to the stream
        const onProgress = (log: string) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", data: log })}\n\n`
            )
          );
        };

        // Get response from agent with progress updates
        const result = await askAgent(message, sessionId, userId, onProgress);

        // Send final response
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "response", data: result.response })}\n\n`
          )
        );

        controller.close();
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", data: error.message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
