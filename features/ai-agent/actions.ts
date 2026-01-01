"use server";

import { clearHistory } from "@/lib/ai/agent";

export async function clearChatHistory(sessionId: string) {
  clearHistory(sessionId);
  return { success: true };
}
