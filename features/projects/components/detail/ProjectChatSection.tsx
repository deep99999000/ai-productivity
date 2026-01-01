"use client";

import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { Loader2, MessageSquare, Hash } from "lucide-react";
import { generateUserToken, getOrCreateProjectChannel, getOrCreateMilestoneChannel } from "@/features/chat/actions";
import { CustomMessage } from "@/features/chat/components/CustomMessage";
import { ReplyContext } from "@/features/chat/context/ReplyContext";
import { ReplyPreview } from "@/features/chat/components/ReplyPreview";
import { CustomQuotedMessage } from "@/features/chat/components/CustomQuotedMessage";
import { COLORS } from "@/features/projects/constants";
import type { Project } from "@/features/projects/schema";
import { Button } from "@/components/ui/button";
import { useProject } from "@/features/projects/store";
import { Badge } from "@/components/ui/badge";

const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

interface ProjectChatSectionProps {
  project: Project;
  userId: string;
}

export default function ProjectChatSection({ project, userId }: ProjectChatSectionProps) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotedMessage, setQuotedMessage] = useState<any | undefined>(undefined);
  const [activeChannel, setActiveChannel] = useState<'project' | number>('project');
  const [currentChannel, setCurrentChannel] = useState<any>(null);
  const { milestones } = useProject();

  const projectMilestones = milestones.filter(m => m.project_id === project.id);

  useEffect(() => {
    const initChat = async () => {
      try {
        const { token, userId: streamUserId, userName, userImage } = await generateUserToken();
        const chatClient = StreamChat.getInstance(apiKey);

        await chatClient.connectUser(
          {
            id: streamUserId,
            name: userName,
            image: userImage,
          },
          token
        );

        setClient(chatClient);
      } catch (error) {
        console.error("Error initializing project chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, []);

  // Handle channel switching
  useEffect(() => {
    const loadChannel = async () => {
      if (!client) return;

      try {
        let channelId: string;

        if (activeChannel === 'project') {
          // Create/get project channel via server action
          const result = await getOrCreateProjectChannel(project.id, project.name, userId);
          channelId = result.channelId;
        } else {
          // Create/get milestone channel via server action
          const milestone = projectMilestones.find(m => m.id === activeChannel);
          if (!milestone) return;
          
          const result = await getOrCreateMilestoneChannel(activeChannel, milestone.name, userId);
          channelId = result.channelId;
        }

        // Now get the channel from the client (it's already created server-side with proper permissions)
        const channel = client.channel('messaging', channelId);

        // Watch the channel to subscribe to events and load messages
        await channel.watch();
        
        setCurrentChannel(channel);
      } catch (error) {
        console.error("Error loading channel:", error);
      }
    };

    loadChannel();
  }, [client, activeChannel, project, projectMilestones, userId]);

  const overrideSubmitHandler = async (params: any) => {
    const { message, cid } = params;
    
    if (!client) return;

    const [type, id] = cid.split(':');
    const channel = client.channel(type, id);

    const messageToSend = {
      ...message,
      quoted_message_id: quotedMessage?.id,
    };

    await channel.sendMessage(messageToSend);
    setQuotedMessage(undefined);
  };

  if (loading) {
    return (
      <div className={`${COLORS.surface.card} border-0 shadow-sm rounded-xl overflow-hidden`}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!client || !currentChannel) {
    return (
      <div className={`${COLORS.surface.card} border-0 shadow-sm rounded-xl overflow-hidden`}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${COLORS.surface.card} border-0 shadow-sm rounded-xl overflow-hidden`}>
      <Chat client={client} theme="str-chat__theme-light">
        <div className="flex h-[600px]">
          {/* Sidebar with channels */}
          <div className="w-64 border-r bg-gray-50 flex flex-col">
            {/* Sidebar Header */}
            <div className="px-4 py-4 border-b bg-white">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Team Chat
              </h3>
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* Project Channel */}
              <button
                onClick={() => setActiveChannel('project')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-1 flex items-center gap-2 ${
                  activeChannel === 'project'
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Hash className="h-4 w-4" />
                <span className="font-medium text-sm">Project General</span>
              </button>

              {/* Milestone Channels */}
              {projectMilestones.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                    Milestones
                  </div>
                  {projectMilestones.map((milestone) => (
                    <button
                      key={milestone.id}
                      onClick={() => setActiveChannel(milestone.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-1 flex items-center gap-2 ${
                        activeChannel === milestone.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-sm">{milestone.emoji || '🎯'}</span>
                      <span className="text-sm truncate flex-1">{milestone.name}</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1.5 py-0"
                      >
                        {milestone.status}
                      </Badge>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ReplyContext.Provider value={{ quotedMessage, setQuotedMessage }}>
              <Channel 
                channel={currentChannel}
                Message={CustomMessage} 
                QuotedMessage={CustomQuotedMessage}
              >
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <ReplyPreview />
                  <MessageInput overrideSubmitHandler={overrideSubmitHandler} />
                </Window>
              </Channel>
            </ReplyContext.Provider>
          </div>
        </div>
      </Chat>
    </div>
  );
}
