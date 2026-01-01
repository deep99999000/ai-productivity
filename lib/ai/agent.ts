import { modelWithTools, tools } from "./tools";

const SYSTEM_MESSAGE = {
  role: "system" as const,
  content: `You are a helpful AI Productivity Assistant that helps users manage their habits and todos/tasks.

You have access to powerful productivity management tools:

**Habit Management:**
- List all habits
- Search habits by name or description
- Create new habits
- Delete habits
- Toggle habit check-ins for specific dates

**Todo/Task Management:**
- List all todos
- Search todos by name or description
- Get todos for today
- Get completed or pending todos
- Create new todos with priority and dates
- Toggle todo completion status
- Delete todos

**Guidelines:**
1. Always be helpful and encouraging about productivity goals
2. When listing items, format them nicely with emojis
3. Provide clear confirmations after actions
4. Suggest related actions when appropriate
5. If searching and not finding results, suggest alternatives
6. Be proactive in helping users stay organized

**Important:**
- You will receive the user's ID in each request - use it for database operations
- When creating items, ask for details if not provided
- Format dates nicely when displaying them
- Use emojis to make responses more engaging

Be friendly, helpful, and motivating!`,
};

// Store chat histories per session
const chatHistories = new Map<string, any[]>();

export async function askAgent(
  question: string,
  sessionId: string,
  userId: string,
  onProgress?: (message: string) => void
) {
  // Get or create history for this session
  let history = chatHistories.get(sessionId) || [];

  // Inject userId context into the question
  const contextualQuestion = `[User ID: ${userId}] ${question}`;

  // Add system message if new session
  const messages: any[] =
    history.length === 0
      ? [SYSTEM_MESSAGE, { role: "user", content: contextualQuestion }]
      : [...history, { role: "user", content: contextualQuestion }];

  // Collect progress logs
  const progressLogs: string[] = [];
  const logProgress = (msg: string) => {
    progressLogs.push(msg);
    onProgress?.(msg);
  };

  logProgress(`🤖 Understanding your request...`);

  // Agent loop - up to 10 iterations
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      logProgress(`🧠 Thinking: Analyzing what needs to be done...`);
    } else {
      logProgress(`🧠 Thinking: Reviewing results and planning next steps...`);
    }

    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (response.tool_calls?.length) {
      // Describe what tools are being used
      const toolDescriptions: { [key: string]: string } = {
        list_all_habits: "Fetching your habits",
        search_habits: "Searching through habits",
        get_habit_by_id: "Getting habit details",
        create_habit: "Creating new habit",
        delete_habit: "Deleting habit",
        toggle_habit_checkin: "Updating habit check-in",
        list_all_todos: "Fetching your todos",
        search_todos: "Searching through todos",
        get_todos_for_today: "Getting today's tasks",
        get_completed_todos: "Fetching completed tasks",
        get_pending_todos: "Fetching pending tasks",
        create_todo: "Creating new todo",
        toggle_todo_status: "Updating todo status",
        delete_todo: "Deleting todo",
        get_todo_by_id: "Getting todo details",
      };

      for (const tc of response.tool_calls) {
        const description =
          toolDescriptions[tc.name] || `Executing ${tc.name.replace(/_/g, " ")}`;
        logProgress(`⚙️ ${description}...`);

        const tool = tools.find((t) => t.name === tc.name);
        if (tool) {
          // Inject userId into tool args if not present
          const args = { ...tc.args };
          if (!args.userId && tc.name !== "get_habit_by_id" && tc.name !== "get_todo_by_id") {
            args.userId = userId;
          }
          const result = await (tool as any).invoke(args);
          messages.push({ role: "tool", content: result, tool_call_id: tc.id });
        }
      }

      logProgress(`📊 Processing results...`);
    } else {
      // Final response - save to history
      logProgress(`✨ Preparing response...`);

      const newHistory = [
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: response.content },
      ];

      // Keep only last 20 messages (10 exchanges)
      if (newHistory.length > 20) {
        newHistory.splice(0, newHistory.length - 20);
      }

      chatHistories.set(sessionId, newHistory);

      return {
        response: response.content,
        logs: progressLogs,
      };
    }
  }

  logProgress(`⚠️ Task is too complex, please try a simpler request`);
  return {
    response:
      "I couldn't complete the task in 10 iterations. Please try breaking it into smaller steps.",
    logs: progressLogs,
  };
}

// Clear history for a session
export function clearHistory(sessionId: string) {
  chatHistories.delete(sessionId);
}

// Get history for debugging
export function getHistory(sessionId: string) {
  return chatHistories.get(sessionId) || [];
}
