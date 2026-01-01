"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getActivityFeed } from "@/features/projects/actions";
import type { ActivityFeed } from "@/features/projects/schema";

interface ActivityFeedProps {
  projectId: number;
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case "created":
      return <Plus className="h-4 w-4 text-emerald-600" />;
    case "updated":
      return <Edit className="h-4 w-4 text-zinc-600" />;
    case "deleted":
      return <Trash2 className="h-4 w-4 text-rose-600" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "commented":
      return <MessageSquare className="h-4 w-4 text-zinc-600" />;
    default:
      return <Activity className="h-4 w-4 text-zinc-500" />;
  }
};

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case "project":
      return "📁";
    case "milestone":
      return "🎯";
    case "task":
      return "✓";
    default:
      return "•";
  }
};

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const data = await getActivityFeed(projectId, 3);
        if (data) {
          setActivities(data);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-zinc-600" />
          <h3 className="font-semibold text-zinc-900">Recent Activity</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-zinc-300 rounded-full"></div>
            <div className="w-2 h-2 bg-zinc-300 rounded-full"></div>
            <div className="w-2 h-2 bg-zinc-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
        <Activity className="h-5 w-5 text-zinc-600" />
        <h3 className="font-semibold text-zinc-900">Recent Activity</h3>
      </div>
      <div className="p-4">
        {activities.length === 0 ? (
          <div className="p-6 text-center bg-zinc-50 rounded-xl">
            <Activity className="h-10 w-10 mx-auto text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-500">
              No activity yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 3).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center">
                  {getActivityIcon(activity.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">
                      {getEntityIcon(activity.entity_type)}
                    </span>
                    <p className="text-sm text-zinc-700">
                      {activity.description}
                    </p>
                  </div>
                  
                  {/* Timestamp */}
                  <p className="text-xs mt-1 text-zinc-400">
                    {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-zinc-900 text-white text-xs">
                      {activity.user_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
