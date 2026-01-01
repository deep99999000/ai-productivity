"use client";

import { useEffect, useState } from "react";
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
import { Loader2, MessageSquare, Maximize2, Minimize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateUserToken, getOrCreateMilestoneChannel } from "@/features/chat/actions";
import { CustomMessage } from "@/features/chat/components/CustomMessage";
import { ReplyContext } from "@/features/chat/context/ReplyContext";
import { ReplyPreview } from "@/features/chat/components/ReplyPreview";
import { CustomQuotedMessage } from "@/features/chat/components/CustomQuotedMessage";
import type { Milestone } from "@/features/projects/schema";

const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

interface MilestoneChatDialogProps {
  milestone: Milestone;
  projectId: number;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MilestoneChatDialog({
  milestone,
  projectId,
  userId,
  open,
  onOpenChange,
}: MilestoneChatDialogProps) {
  const router = useRouter();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotedMessage, setQuotedMessage] = useState<any | undefined>(undefined);
  const [currentChannel, setCurrentChannel] = useState<any>(null);

  useEffect(() => {
    if (!open) return;

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
        console.error("Error initializing milestone chat:", error);
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
  }, [open]);

  useEffect(() => {
    const loadChannel = async () => {
      if (!client || !open) return;

      try {
        // Create/get milestone channel via server action
        const result = await getOrCreateMilestoneChannel(milestone.id, milestone.name, userId);
        const channelId = result.channelId;

        // Get the channel from the client
        const channel = client.channel('messaging', channelId);

        // Watch the channel
        await channel.watch();
        
        setCurrentChannel(channel);
      } catch (error) {
        console.error("Error loading milestone channel:", error);
      }
    };

    loadChannel();
  }, [client, milestone, userId, open]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-4xl h-[600px]">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">{milestone.emoji || '🎯'}</span>
              <span>{milestone.name} - Team Chat</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/projects/${projectId}/chat/${milestone.id}`)}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading || !client || !currentChannel ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
