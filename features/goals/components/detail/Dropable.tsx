"use client";
import React, { PropsWithChildren } from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function Droppable({ children }: PropsWithChildren) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  });

  const style = {
    color: isOver ? 'green' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}