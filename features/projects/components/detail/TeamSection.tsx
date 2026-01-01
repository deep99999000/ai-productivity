"use client";

import { useEffect, useState } from "react";
import { Plus, Mail, Shield, Trash2, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COLORS } from "@/features/projects/constants";
import { 
  getProjectMembers, 
  addProjectMemberAction,
  removeProjectMemberAction,
  getUserByEmail
} from "@/features/projects/actions";
import type { ProjectMember, NewProjectMember } from "@/features/projects/schema";
import { useProject } from "@/features/projects/store";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

interface TeamSectionProps {
  projectId: number;
  userId: string;
}

const ROLE_CONFIG = {
  owner: { label: "Owner", color: "bg-purple-600", icon: "👑" },
  admin: { label: "Admin", color: "bg-blue-600", icon: "⚡" },
  editor: { label: "Editor", color: "bg-green-600", icon: "✏️" },
  viewer: { label: "Viewer", color: "bg-gray-600", icon: "👁️" },
};

export default function TeamSection({ projectId, userId }: TeamSectionProps) {
  const { projectMembers, setProjectMembers, addProjectMember, removeProjectMember } = useProject();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<any[]>([]); // Store members with user info
  
  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("viewer");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const fetchedMembers = await getProjectMembers(projectId);
        if (fetchedMembers) {
          setMembers(fetchedMembers);
          setProjectMembers(fetchedMembers as any);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load team members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [projectId, setProjectMembers]);

  const handleAddMember = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsSubmitting(true);

      // Look up user by email first
      const user = await getUserByEmail(email.trim());
      
      if (!user) {
        toast.error("User not found. They must have an account first.");
        return;
      }

      // Create new member data
      const newMember: NewProjectMember = {
        project_id: projectId,
        user_id: user.id, // Use the actual user ID from the database
        role: role as "owner" | "admin" | "editor" | "viewer",
        can_edit_project: role === "owner" || role === "admin" || role === "editor",
        can_delete_project: role === "owner" || role === "admin",
        can_manage_members: role === "owner" || role === "admin",
        can_create_milestones: role === "owner" || role === "admin" || role === "editor",
        can_create_tasks: role === "owner" || role === "admin" || role === "editor",
        invited_by: userId,
      };

      const result = await addProjectMemberAction(newMember);
      if (result) {
        // Fetch updated members list to get user info
        const updatedMembers = await getProjectMembers(projectId);
        if (updatedMembers) {
          setMembers(updatedMembers);
          setProjectMembers(updatedMembers as any);
        }
        toast.success("Team member added successfully");
        setIsAddDialogOpen(false);
        setEmail("");
        setRole("viewer");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await removeProjectMemberAction(memberId);
      removeProjectMember(memberId);
      toast.success("Team member removed");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove team member");
    }
  };

  if (isLoading) {
    return <Loading message="Loading team members..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${COLORS.text.primary}`}>Team Members</h2>
          <p className={`mt-1 ${COLORS.text.secondary}`}>
            Manage project team and permissions
          </p>
        </div>
        <Button
          className={`${COLORS.primary.gradient} text-white`}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`${COLORS.surface.card} border-0 shadow`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${COLORS.text.muted}`}>Total</p>
                <p className={`text-xl font-bold ${COLORS.text.primary}`}>
                  {members.length}
                </p>
              </div>
              <Users className={`h-6 w-6 ${COLORS.primary.text}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`${COLORS.surface.card} border-0 shadow`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${COLORS.text.muted}`}>Admins</p>
                <p className="text-xl font-bold text-blue-600">
                  {members.filter(m => m.role === "admin" || m.role === "owner").length}
                </p>
              </div>
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${COLORS.surface.card} border-0 shadow`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${COLORS.text.muted}`}>Editors</p>
                <p className="text-xl font-bold text-green-600">
                  {members.filter(m => m.role === "editor").length}
                </p>
              </div>
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${COLORS.surface.card} border-0 shadow`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${COLORS.text.muted}`}>Viewers</p>
                <p className="text-xl font-bold text-gray-600">
                  {members.filter(m => m.role === "viewer").length}
                </p>
              </div>
              <Users className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <Card className={`${COLORS.surface.card} border-0 shadow-lg`}>
          <CardContent className="p-12 text-center">
            <Users className={`h-16 w-16 mx-auto ${COLORS.text.muted}`} />
            <h3 className={`mt-4 text-lg font-semibold ${COLORS.text.primary}`}>
              No team members yet
            </h3>
            <p className={`mt-2 ${COLORS.text.secondary}`}>
              Add team members to collaborate on this project
            </p>
            <Button
              className={`mt-6 ${COLORS.primary.gradient} text-white`}
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.viewer;
            
            return (
              <Card key={member.id} className={`${COLORS.surface.card} border-0 shadow hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`${COLORS.primary.bg} text-white`}>
                        {member.user_name ? member.user_name.substring(0, 2).toUpperCase() : member.user_email?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${COLORS.text.primary}`}>
                          {member.user_name || member.user_email || member.user_id}
                        </p>
                        <span className="text-base">{roleConfig.icon}</span>
                      </div>
                      
                      {member.user_email && (
                        <p className={`text-xs ${COLORS.text.muted} truncate`}>
                          {member.user_email}
                        </p>
                      )}
                      
                      <Badge className={`mt-1 ${roleConfig.color} text-white text-xs`}>
                        {roleConfig.label}
                      </Badge>

                      {/* Permissions */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {member.can_edit_project && (
                          <Badge variant="outline" className="text-xs">
                            Edit
                          </Badge>
                        )}
                        {member.can_manage_members && (
                          <Badge variant="outline" className="text-xs">
                            Manage Team
                          </Badge>
                        )}
                        {member.can_create_tasks && (
                          <Badge variant="outline" className="text-xs">
                            Create Tasks
                          </Badge>
                        )}
                      </div>

                      {/* Join date */}
                      {member.joined_at && (
                        <p className={`text-xs mt-2 ${COLORS.text.muted}`}>
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className={COLORS.text.primary}>Add Team Member</DialogTitle>
            <DialogDescription>
              Invite a team member to collaborate on this project by entering their email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <span>👁️</span>
                      <span>Viewer - Can view only</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <span>✏️</span>
                      <span>Editor - Can edit and create</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <span>⚡</span>
                      <span>Admin - Full access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Description */}
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600">
                  {role === "viewer" && "Viewers can view project content but cannot make changes."}
                  {role === "editor" && "Editors can create and edit milestones, tasks, and comments."}
                  {role === "admin" && "Admins have full access including managing team members."}
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className={`${COLORS.primary.gradient} text-white`}
              onClick={handleAddMember}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
