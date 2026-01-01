"use server";

import { StreamChat } from "stream-chat";
import { auth } from "@/auth";
import { db } from "@/db";
import { usersTable } from "@/features/auth/userSchema";
import { milestonesTable, projectMembersTable } from "@/features/projects/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;
const apiSecret = process.env.STREAM_SECRET!;

// Initialize Stream Chat server client with increased timeout
const serverClient = StreamChat.getInstance(apiKey, apiSecret, {
  timeout: 10000, // 10 seconds timeout
});

// Helper function to create a short, deterministic channel ID
function createChannelId(userId1: string, userId2: string): string {
  // Sort to ensure consistency regardless of order
  const sorted = [userId1, userId2].sort();
  const combined = sorted.join("-");
  
  // If under 64 chars, use as-is
  if (combined.length <= 64) {
    return combined;
  }
  
  // Otherwise, create a hash-based ID
  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  return `dm-${hash.substring(0, 60)}`; // dm- prefix + 60 chars = 63 chars total
}

export async function generateUserToken() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id || session.user.email?.replace(/[^a-zA-Z0-9]/g, "_");
  
  if (!userId) {
    throw new Error("User ID not found");
  }

  try {
    // Upsert user in Stream Chat to ensure they exist
    await serverClient.upsertUser({
      id: userId,
      name: session.user.name || "User",
      image: session.user.image || undefined,
      role: "admin",
    });
  } catch (error) {
    console.error("Error upserting user to Stream Chat:", error);
    // Continue even if upsert fails - token generation might still work
  }

  // Generate token for the user
  const token = serverClient.createToken(userId);

  return {
    token,
    userId,
    userName: session.user.name || "User",
    userImage: session.user.image || undefined,
  };
}

export async function createChannel(channelId: string, channelName: string, memberIds: string[]) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id || session.user.email?.replace(/[^a-zA-Z0-9]/g, "_");
  
  if (!userId) {
    throw new Error("User ID not found");
  }

  const channel = serverClient.channel("messaging", channelId, {
    members: [userId, ...memberIds],
    created_by_id: userId,
  });

  await channel.create();

  return { channelId, channelName };
}

export async function getOrCreateDirectMessage(otherUserId: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id || session.user.email?.replace(/[^a-zA-Z0-9]/g, "_");
  
  if (!userId) {
    throw new Error("User ID not found");
  }

  // Upsert the other user so they exist in Stream
  await serverClient.upsertUser({
    id: otherUserId,
    role: "admin",
  });

  // Create a unique channel ID (max 64 characters)
  const channelId = createChannelId(userId, otherUserId);

  const channel = serverClient.channel("messaging", channelId, {
    members: [userId, otherUserId],
    created_by_id: userId,
  });

  try {
    await channel.create();
  } catch (error: any) {
    // If channel already exists, we're good
    if (error.code !== 4) {
      throw error;
    }
  }

  return { channelId };
}

export async function getOrCreateDirectMessageByEmail(email: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id || session.user.email?.replace(/[^a-zA-Z0-9]/g, "_");
  
  if (!userId) {
    throw new Error("User ID not found");
  }

  // Look up the other user by email in the database
  const [otherUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!otherUser) {
    throw new Error("User not found. They need to sign up first.");
  }

  const otherUserId = otherUser.id || otherUser.email.replace(/[^a-zA-Z0-9]/g, "_");

  // Upsert the other user in Stream so they exist
  await serverClient.upsertUser({
    id: otherUserId,
    name: otherUser.name || "User",
    role: "admin",
  });

  // Create a unique channel ID (max 64 characters)
  const channelId = createChannelId(userId, otherUserId);

  const channel = serverClient.channel("messaging", channelId, {
    members: [userId, otherUserId],
    created_by_id: userId,
  });

  try {
    await channel.create();
  } catch (error: any) {
    // If channel already exists, we're good
    if (error.code !== 4) {
      throw error;
    }
  }

  return { channelId, otherUserName: otherUser.name || "User" };
}

export async function getOrCreateProjectChannel(projectId: number, projectName: string, userId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const channelId = `project-${projectId}`;

  // Ensure current user exists in Stream
  await serverClient.upsertUser({
    id: userId,
    name: session.user.name || "User",
    role: "admin",
  });

  const channel = serverClient.channel("messaging", channelId, {
    name: `${projectName} - General`,
    members: [userId],
    created_by_id: userId,
  });

  try {
    await channel.create();
  } catch (error: any) {
    // If channel already exists, try to add user as member
    if (error.code === 4) {
      try {
        await channel.addMembers([userId]);
      } catch (addError) {
        // User might already be a member, that's fine
        console.log("User already a member or error adding:", addError);
      }
    } else {
      throw error;
    }
  }

  return { channelId };
}

export async function getOrCreateMilestoneChannel(
  milestoneId: number, 
  milestoneName: string, 
  userId: string
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const channelId = `milestone-${milestoneId}`;

  // Get the milestone to find its project
  const milestone = await db
    .select()
    .from(milestonesTable)
    .where(eq(milestonesTable.id, milestoneId))
    .limit(1);

  if (!milestone[0]) {
    throw new Error("Milestone not found");
  }

  const projectId = milestone[0].project_id;

  // Get all project members
  const projectMembers = await db
    .select()
    .from(projectMembersTable)
    .where(eq(projectMembersTable.project_id, projectId));

  // Get all member user IDs
  const memberIds = projectMembers.map(m => m.user_id);
  
  // Ensure current user is included
  if (!memberIds.includes(userId)) {
    memberIds.push(userId);
  }

  // Ensure all members exist in Stream
  try {
    for (const memberId of memberIds) {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, memberId))
        .limit(1);

      if (user[0]) {
        await serverClient.upsertUser({
          id: memberId,
          name: user[0].name || "User",
          image: user[0].image || undefined,
          role: "admin",
        });
      }
    }
  } catch (error) {
    console.error("Error upserting users:", error);
    // Continue even if some users fail
  }

  const channel = serverClient.channel("messaging", channelId, {
    name: milestoneName,
    members: memberIds,
    created_by_id: userId,
  });

  try {
    await channel.create();
  } catch (error: any) {
    // If channel already exists, try to add all members
    if (error.code === 4) {
      try {
        await channel.addMembers(memberIds);
      } catch (addError) {
        // Members might already be added, that's fine
        console.log("Members already added or error adding:", addError);
      }
    } else {
      throw error;
    }
  }

  return { channelId };
}

export async function deleteAllChannels() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  // Query all channels of type messaging
  const channels = await serverClient.queryChannels({ type: "messaging" });

  // Delete them one by one
  const deletePromises = channels.map((channel) => channel.delete());
  await Promise.all(deletePromises);

  return { success: true, count: channels.length };
}
