import ProjectsDashboard from '@/features/projects/components/dashboard/ProjectsDashboard';
import { getuser } from '@/lib/actions/getuser';

const ProjectsPage = async () => {
  // Get user ID from session
  const userId = await getuser();
  
  return (
    <ProjectsDashboard user_id={userId ?? ""} />
  );
};

export default ProjectsPage;
