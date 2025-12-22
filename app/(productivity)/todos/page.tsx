"use client";

import { useEffect, useState } from "react";
import { getAllUserTodos } from "@/features/todo/actions";
import { getAllUserGoals } from "@/features/goals/actions";
import TodoMain from "@/features/todo/components/redesign/TodoMain";
import { useTodo } from "@/features/todo/store";
import { getuser } from "@/lib/actions/getuser";
import { Goal } from "@/features/goals/schema";

export default function DashboardTodosPage() {
  // 🗂 Global todos store
  const { todos, setTodos } = useTodo();
  const [goals, setGoals] = useState<Goal[]>([]);

  // 🔄 Fetch todos and goals on mount
  useEffect(() => {
    const fetchData = async () => {
      // 👤 Get user ID
      const user_id = await getuser();
      if (!user_id) return;

      // 📥 Fetch all todos and goals in parallel
      const [allTodos, allGoals] = await Promise.all([
        getAllUserTodos(user_id),
        getAllUserGoals(user_id)
      ]);

      if (allTodos) setTodos(allTodos);
      if (allGoals) setGoals(allGoals);
    };

    fetchData();
  }, [setTodos]);

  return (
    // 📋 Render todo list
    <TodoMain allTodo={todos} allGoals={goals} />
  );
}
