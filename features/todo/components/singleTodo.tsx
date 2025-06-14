"use client";

import React, { useState } from "react";
import { updateTodosStatus } from "../todoaction";

export interface singleTodoSchema {
  name: string;
  description: string | null | undefined;
  isDone: boolean | null | undefined;
}

const SingleTodo: React.FC<singleTodoSchema> = ({
  name,
  description,
  isDone,
}) => {
  const [checked, setChecked] = useState(!!isDone);

  const handleCheck = async () => {
    setChecked(!checked);
    const updated = await updateTodosStatus(!checked);
  };

  return (
    <div>
      <p>{name}</p>
      <p>{description}</p>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleCheck}
      />
    </div>
  );
};

export default SingleTodo;
