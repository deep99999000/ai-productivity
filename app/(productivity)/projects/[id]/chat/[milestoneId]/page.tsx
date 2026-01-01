"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateUserToken, getOrCreateProjectChannel, getOrCreateMilestoneChannel } from "@/features/chat/actions";
import { CustomMessage } from "@/features/chat/components/CustomMessage";
import { ReplyContext } from "@/features/chat/context/ReplyContext";
import { ReplyPreview } from "@/features/chat/components/ReplyPreview";
import { CustomQuotedMessage } from "@/features/chat/components/CustomQuotedMessage";
import { getuser } from "@/lib/actions/getuser";
import { getProjectById, getMilestonesByProject } from "@/features/projects/actions";

const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

export default function ProjectChatPage({ params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const projectId = parseInt(unwrappedParams.id);
  const milestoneId = parseInt(unwrappedParams.milestoneId);
  
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotedMessage, setQuotedMessage] = useState<any | undefined>(undefined);
  const [currentChannel, setCurrentChannel] = useState<any>(null);
  const [chatTitle, setChatTitle] = useState<string>("");
  const [chatEmoji, setChatEmoji] = useState<string>("💬");
  const [userId, setUserId] = useState<string>("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationEnabled(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setNotificationEnabled(true);
          }
        });
      }
    }
  }, []);

  // Setup notification listeners
  useEffect(() => {
    if (!client || !notificationEnabled) return;

    const handleNewMessage = (event: any) => {
      console.log('🔔 NEW MESSAGE EVENT in milestone chat:', {
        messageText: event.message?.text,
        fromUser: event.user?.name,
        fromUserId: event.user?.id,
        currentClientUserId: client.userID,
        notificationPermission: Notification.permission,
      });
      
      const message = event.message;
      
      // Don't notify for own messages - use client.userID instead of userId state
      if (event.user?.id === client.userID) {
        console.log('⏭️ Skipping - message is from current user');
        return;
      }

      console.log('✅ Message from another user, checking permission...');

      // Show notification
      if (Notification.permission === 'granted') {
        console.log('✅ Creating notification...');
        
        try {
          const notification = new Notification(
            `${message.user?.name || 'Someone'} in ${chatTitle || 'Milestone Chat'}`,
            {
              body: message.text || 'Sent a message',
              icon: message.user?.image || '/favicon.ico',
              tag: message.id,
              requireInteraction: false,
            }
          );

          console.log('✅ Notification created successfully');

          // Close notification after 5 seconds
          setTimeout(() => notification.close(), 5000);

          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.error('❌ Error creating notification:', error);
        }
      } else {
        console.log('❌ Notification permission not granted:', Notification.permission);
      }
    };

    console.log('✅ Registering event listeners for milestone chat');
    
    // Listen to both message.new and notification.message_new events
    client.on('message.new', handleNewMessage);
    client.on('notification.message_new', handleNewMessage);

    return () => {
      console.log('🧹 Cleaning up event listeners');
      client.off('message.new', handleNewMessage);
      client.off('notification.message_new', handleNewMessage);
    };
  }, [client, notificationEnabled, userId, chatTitle]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const currentUserId = await getuser();
        if (!currentUserId) {
          router.push('/signin');
          return;
        }
        setUserId(currentUserId);

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
        console.error("Error initializing chat:", error);
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

  useEffect(() => {
    const loadChannel = async () => {
      if (!client || !userId) return;

      try {
        console.log("Loading channel for project:", projectId, "milestone:", milestoneId);
        
        // Get project and milestones separately
        const [project, milestones] = await Promise.all([
          getProjectById(projectId),
          getMilestonesByProject(projectId)
        ]);
        
        console.log("Project loaded:", project ? "Success" : "Failed");
        console.log("Milestones loaded:", milestones?.length || 0);
        
        if (!project) {
          console.error("Project not found, redirecting to /projects");
          router.push('/projects');
          return;
        }

        // Find the milestone
        const milestone = milestones?.find((m: any) => m.id === milestoneId);
        console.log("Milestone found:", milestone ? milestone.name : "Not found");
        
        if (!milestone) {
          console.error("Milestone not found, redirecting to project");
          router.push(`/projects/${projectId}`);
          return;
        }

        // Create/get milestone channel
        const result = await getOrCreateMilestoneChannel(
          milestoneId,
          milestone.name,
          userId
        );
        
        setChatTitle(milestone.name);
        setChatEmoji(milestone.emoji || "🎯");

        // Get the channel from the client
        const channel = client.channel('messaging', result.channelId);

        // Watch the channel
        await channel.watch();
        
        setCurrentChannel(channel);
        console.log("Channel loaded successfully");
      } catch (error) {
        console.error("Error loading channel:", error);
      }
    };

    loadChannel();
  }, [client, projectId, milestoneId, userId, router]);

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

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  if (loading || !client || !currentChannel) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{chatEmoji}</span>
          <h1 className="text-lg font-semibold text-gray-900">{chatTitle}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <Chat client={client} theme="str-chat__theme-light">
          <ReplyContext.Provider value={{ quotedMessage, setQuotedMessage }}>
            <Channel 
              channel={currentChannel}
              Message={CustomMessage} 
              QuotedMessage={CustomQuotedMessage}
            >
              <Window>
                <MessageList />
                <ReplyPreview />
                <MessageInput overrideSubmitHandler={overrideSubmitHandler} />
              </Window>
            </Channel>
          </ReplyContext.Provider>
        </Chat>
      </div>
    </div>
  );
}
