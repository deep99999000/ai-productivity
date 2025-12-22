import HabitsDashboard from '@/features/habits/components/list/HabitsDashboard'
import { getuser } from '@/lib/actions/getuser'

const HabitsPage = async () => {
  // 👤 Get user ID from session
  const userId = await getuser()
  
  return (
    // 📊 Render habits dashboard
    <HabitsDashboard user_id={userId ?? ""} />
  )
}

export default HabitsPage
