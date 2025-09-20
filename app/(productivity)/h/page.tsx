import HabitsDashboard from '@/features/habits/components/HabitsDashboard'
import { getuser } from '@/lib/actions/getuser'
import React from 'react'

const page = async() => {
 const id = await getuser()
 console.log(id)
 
 if(!id) {
    return <div>not logged in</div>
    }
  return <HabitsDashboard />
}

export default page