import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/db";
import { habitTable, todoTable, goalTable, subgoalTable } from "@/db/schema";
import { eq, ilike, and, gte, lte, or } from "drizzle-orm";
import { formatISO } from "date-fns";

// Initialize Ollama model with cloud API
const model = new ChatOllama({
  model: "kimi-k2:1t",
  baseUrl: "https://ollama.com",
  headers: {
    Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
  },
  temperature: 0,
});

// ============= HABIT TOOLS =============

const listAllHabitsTool = tool(
  async ({ userId }) => {
    console.log(`📋 Listing all habits for user: ${userId}`);
    const habits = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.user_id, userId));
    return JSON.stringify({ success: true, habits, count: habits.length });
  },
  {
    name: "list_all_habits",
    description: "List all habits for the user",
    schema: z.object({
      userId: z.string().describe("The user ID"),
    }),
  }
);

const searchHabitsTool = tool(
  async ({ userId, searchTerm }) => {
    console.log(`🔍 Searching habits for: ${searchTerm}`);
    const habits = await db
      .select()
      .from(habitTable)
      .where(
        and(
          eq(habitTable.user_id, userId),
          or(
            ilike(habitTable.name, `%${searchTerm}%`),
            ilike(habitTable.description, `%${searchTerm}%`)
          )
        )
      );
    return JSON.stringify({ success: true, habits, count: habits.length });
  },
  {
    name: "search_habits",
    description: "Search habits by name or description",
    schema: z.object({
      userId: z.string().describe("The user ID"),
      searchTerm: z.string().describe("Search term to find in habit name or description"),
    }),
  }
);

const getHabitByIdTool = tool(
  async ({ habitId }) => {
    console.log(`🔎 Getting habit by ID: ${habitId}`);
    const [habit] = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.id, habitId));
    if (!habit) {
      return JSON.stringify({ success: false, error: "Habit not found" });
    }
    return JSON.stringify({ success: true, habit });
  },
  {
    name: "get_habit_by_id",
    description: "Get a specific habit by its ID",
    schema: z.object({
      habitId: z.number().describe("The habit ID"),
    }),
  }
);

const createHabitTool = tool(
  async ({ userId, name, description, emoji }) => {
    console.log(`➕ Creating habit: ${name}`);
    const id = Date.now();
    const [habit] = await db
      .insert(habitTable)
      .values({
        id,
        user_id: userId,
        name,
        description: description || null,
        emoji: emoji || "✅",
        highestStreak: 0,
        checkInDays: [],
      })
      .returning();
    return JSON.stringify({ success: true, habit, message: `Habit "${name}" created successfully` });
  },
  {
    name: "create_habit",
    description: "Create a new habit for the user",
    schema: z.object({
      userId: z.string().describe("The user ID"),
      name: z.string().describe("Name of the habit"),
      description: z.string().optional().describe("Description of the habit"),
      emoji: z.string().optional().describe("Emoji for the habit (default: ✅)"),
    }),
  }
);

const deleteHabitTool = tool(
  async ({ habitId }) => {
    console.log(`🗑️ Deleting habit: ${habitId}`);
    const [deleted] = await db
      .delete(habitTable)
      .where(eq(habitTable.id, habitId))
      .returning();
    if (!deleted) {
      return JSON.stringify({ success: false, error: "Habit not found" });
    }
    return JSON.stringify({ success: true, message: `Habit "${deleted.name}" deleted successfully` });
  },
  {
    name: "delete_habit",
    description: "Delete a habit by ID",
    schema: z.object({
      habitId: z.number().describe("The habit ID to delete"),
    }),
  }
);

const toggleHabitCheckinTool = tool(
  async ({ habitId, date }) => {
    const dayString = date || formatISO(new Date(), { representation: "date" });
    console.log(`✅ Toggling check-in for habit ${habitId} on ${dayString}`);
    
    const [habit] = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.id, habitId));

    if (!habit) {
      return JSON.stringify({ success: false, error: "Habit not found" });
    }

    let updatedDays: string[];
    const currentDays = habit.checkInDays ?? [];

    if (currentDays.includes(dayString)) {
      updatedDays = currentDays.filter((d) => d !== dayString);
    } else {
      updatedDays = [...currentDays, dayString];
    }

    await db
      .update(habitTable)
      .set({ checkInDays: updatedDays })
      .where(eq(habitTable.id, habitId));

    return JSON.stringify({ 
      success: true, 
      message: currentDays.includes(dayString) 
        ? `Unchecked habit "${habit.name}" for ${dayString}` 
        : `Checked in habit "${habit.name}" for ${dayString}`,
      checkInDays: updatedDays 
    });
  },
  {
    name: "toggle_habit_checkin",
    description: "Toggle check-in for a habit on a specific date (or today if not specified)",
    schema: z.object({
      habitId: z.number().describe("The habit ID"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
    }),
  }
);

// ============= TODO/TASK TOOLS =============

const listAllTodosTool = tool(
  async ({ userId }) => {
    console.log(`📋 Listing all todos for user: ${userId}`);
    const todos = await db
      .select()
      .from(todoTable)
      .where(eq(todoTable.user_id, userId));
    return JSON.stringify({ success: true, todos, count: todos.length });
  },
  {
    name: "list_all_todos",
    description: "List all todos/tasks for the user",
    schema: z.object({
      userId: z.string().describe("The user ID"),
    }),
  }
);

const searchTodosTool = tool(
  async ({ userId, searchTerm }) => {
    console.log(`🔍 Searching todos for: ${searchTerm}`);
    const todos = await db
      .select()
      .from(todoTable)
      .where(
        and(
          eq(todoTable.user_id, userId),
          or(
            ilike(todoTable.name, `%${searchTerm}%`),
            ilike(todoTable.description, `%${searchTerm}%`)
          )
        )
      );
    return JSON.stringify({ success: true, todos, count: todos.length });
  },
  {
    name: "search_todos",
    description: "Search todos/tasks by name or description",
    schema: z.object({
      userId: z.string().describe("The user ID"),
      searchTerm: z.string().describe("Search term to find in todo name or description"),
    }),
  }
);

const getTodosForTodayTool = tool(
  async ({ userId }) => {
    console.log(`📅 Getting todos for today`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todos = await db
      .select()
      .from(todoTable)
      .where(
        and(
          eq(todoTable.user_id, userId),
          or(
            and(gte(todoTable.endDate, today), lte(todoTable.endDate, tomorrow)),
            and(gte(todoTable.startDate, today), lte(todoTable.startDate, tomorrow))
          )
        )
      );
    return JSON.stringify({ success: true, todos, count: todos.length, date: formatISO(today, { representation: "date" }) });
  },
  {
    name: "get_todos_for_today",
    description: "Get all todos/tasks scheduled for today",
    schema: z.object({
      userId: z.string().describe("The user ID"),
    }),
  }
);

const getCompletedTodosTool = tool(
  async ({ userId }) => {
    console.log(`✅ Getting completed todos`);
    const todos = await db
      .select()
      .from(todoTable)
      .where(and(eq(todoTable.user_id, userId), eq(todoTable.isDone, true)));
    return JSON.stringify({ success: true, todos, count: todos.length });
  },
  {
    name: "get_completed_todos",
    description: "Get all completed todos/tasks",
    schema: z.object({
      userId: z.string().describe("The user ID"),
    }),
  }
);

const getPendingTodosTool = tool(
  async ({ userId }) => {
    console.log(`⏳ Getting pending todos`);
    const todos = await db
      .select()
      .from(todoTable)
      .where(and(eq(todoTable.user_id, userId), eq(todoTable.isDone, false)));
    return JSON.stringify({ success: true, todos, count: todos.length });
  },
  {
    name: "get_pending_todos",
    description: "Get all pending (not completed) todos/tasks",
    schema: z.object({
      userId: z.string().describe("The user ID"),
    }),
  }
);

const createTodoTool = tool(
  async ({ userId, name, description, category, priority, startDate, endDate }) => {
    console.log(`➕ Creating todo: ${name}`);
    const [todo] = await db
      .insert(todoTable)
      .values({
        user_id: userId,
        name,
        description: description || null,
        category: category || null,
        priority: priority || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isDone: false,
      })
      .returning();
    return JSON.stringify({ success: true, todo, message: `Todo "${name}" created successfully` });
  },
  {
    name: "create_todo",
    description: "Create a new todo/task for the user",
    schema: z.object({
      userId: z.string().describe("The user ID"),
      name: z.string().describe("Name of the todo"),
      description: z.string().optional().describe("Description of the todo"),
      category: z.string().optional().describe("Category of the todo"),
      priority: z.string().optional().describe("Priority level (low, medium, high)"),
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("End/due date in YYYY-MM-DD format"),
    }),
  }
);

const toggleTodoStatusTool = tool(
  async ({ todoId, userId }) => {
    console.log(`🔄 Toggling todo status: ${todoId}`);
    const [todo] = await db
      .select()
      .from(todoTable)
      .where(and(eq(todoTable.id, todoId), eq(todoTable.user_id, userId)));

    if (!todo) {
      return JSON.stringify({ success: false, error: "Todo not found" });
    }

    const [updated] = await db
      .update(todoTable)
      .set({ isDone: !todo.isDone })
      .where(eq(todoTable.id, todoId))
      .returning();

    return JSON.stringify({ 
      success: true, 
      todo: updated, 
      message: updated.isDone 
        ? `Todo "${updated.name}" marked as completed` 
        : `Todo "${updated.name}" marked as pending` 
    });
  },
  {
    name: "toggle_todo_status",
    description: "Toggle the completion status of a todo/task",
    schema: z.object({
      todoId: z.number().describe("The todo ID"),
      userId: z.string().describe("The user ID"),
    }),
  }
);

const deleteTodoTool = tool(
  async ({ todoId }) => {
    console.log(`🗑️ Deleting todo: ${todoId}`);
    const [deleted] = await db
      .delete(todoTable)
      .where(eq(todoTable.id, todoId))
      .returning();
    if (!deleted) {
      return JSON.stringify({ success: false, error: "Todo not found" });
    }
    return JSON.stringify({ success: true, message: `Todo "${deleted.name}" deleted successfully` });
  },
  {
    name: "delete_todo",
    description: "Delete a todo/task by ID",
    schema: z.object({
      todoId: z.number().describe("The todo ID to delete"),
    }),
  }
);

const getTodoByIdTool = tool(
  async ({ todoId }) => {
    console.log(`🔎 Getting todo by ID: ${todoId}`);
    const [todo] = await db
      .select()
      .from(todoTable)
      .where(eq(todoTable.id, todoId));
    if (!todo) {
      return JSON.stringify({ success: false, error: "Todo not found" });
    }
    return JSON.stringify({ success: true, todo });
  },
  {
    name: "get_todo_by_id",
    description: "Get a specific todo/task by its ID",
    schema: z.object({
      todoId: z.number().describe("The todo ID"),
    }),
  }
);

// Export all tools
export const tools = [
  // Habit tools
  listAllHabitsTool,
  searchHabitsTool,
  getHabitByIdTool,
  createHabitTool,
  deleteHabitTool,
  toggleHabitCheckinTool,
  // Todo tools
  listAllTodosTool,
  searchTodosTool,
  getTodosForTodayTool,
  getCompletedTodosTool,
  getPendingTodosTool,
  createTodoTool,
  toggleTodoStatusTool,
  deleteTodoTool,
  getTodoByIdTool,
];

export const modelWithTools = model.bindTools(tools);
