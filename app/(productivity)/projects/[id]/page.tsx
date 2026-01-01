import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProjectDetail from "@/features/projects/components/detail/ProjectDetail";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Await params before accessing its properties (Next.js 15+)
  const resolvedParams = await params;
  const projectId = parseInt(resolvedParams.id);

  if (isNaN(projectId)) {
    redirect("/projects");
  }

  return <ProjectDetail projectId={projectId} userId={session.user.id} />;
}
