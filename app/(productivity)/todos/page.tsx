// app/dashboard/todos/page.tsx
import { getAllUserTodos } from "@/features/todo/todoaction";
import TodoPage from "@/features/todo/components/TodoPage";
import { getuser } from "@/lib/actions/getuser";

export const dynamic = "force-dynamic";

export default async function DashboardTodosPage() {
  const user_id = await getuser();
  const allTodos = await getAllUserTodos(user_id);

  if (!allTodos || allTodos.length === 0) {
    return (
      <div className="p-4 text-center text-red-600">
        No todos found or failed to load.
      </div>
    );
  }

  return <TodoPage allTodo={allTodos} />;
}