import type { Goal } from '@/features/goals/goalSchema'
import React from 'react'

const Goalspage = () => {
    const new = (goal: Goal) => {
    goal.subgoals?.forEach((goa) =>{
      console.log(goa.tasks.forEach((g) => {
        console.log(g.name);
      }));
      
    })
  };
  
  return (
    <div>Goals</div>
  )
}
export default Goalspage