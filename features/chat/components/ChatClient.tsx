"use client";

import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { generateUserToken } from "../actions";
import { Loader2, Plus, MoreHorizontal } from "lucide-react";
import NewChatDialog from "./NewChatDialog";
import { CustomMessage } from "./CustomMessage";
import { ReplyContext } from "../context/ReplyContext";
import { ReplyPreview } from "./ReplyPreview";
import { CustomQuotedMessage } from "./CustomQuotedMessage";
import { NotificationButton } from "./NotificationButton";

const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;

export default function ChatClient() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [quotedMessage, setQuotedMessage] = useState<any | undefined>(undefined);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
        }

        // Get user token from server
        const { token, userId, userName, userImage } = await generateUserToken();

        // Initialize Stream Chat client
        const chatClient = StreamChat.getInstance(apiKey);

        // Connect user
        await chatClient.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        console.log('Chat client connected, setting up event listeners...');

        // Set up notification listener for new messages
        const handleNewMessage = (event: any) => {
          console.log('🔔 NEW MESSAGE EVENT RECEIVED:', {
            messageText: event.message?.text,
            fromUser: event.user?.name,
            fromUserId: event.user?.id,
            currentUserId: userId,
            notificationPermission: Notification.permission,
          });
          
          // Only show notification if the message is from someone else
          if (event.user?.id !== userId) {
            console.log('✅ Message from another user');
            
            if (Notification.permission === 'granted') {
              console.log('✅ Creating notification...');
              
              try {
                const notification = new Notification(
                  `${event.user?.name || 'Someone'} sent a message`,
                  {
                    body: event.message?.text || 'New message',
                    icon: event.user?.image || '/favicon.ico',
                    tag: event.message?.id,
                    requireInteraction: false,
                    badge: '/favicon.ico',
                  }
                );

                console.log('✅ Notification created successfully');

                // Close notification after 5 seconds
                setTimeout(() => notification.close(), 5000);

                // Focus the window when notification is clicked
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
          } else {
            console.log('⏭️ Skipping - message is from current user');
          }
        };

        chatClient.on('message.new', handleNewMessage);
        chatClient.on('notification.message_new', handleNewMessage);
        
        console.log('✅ Event listeners registered');

        setClient(chatClient);
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      if (client) {
        console.log('Cleaning up event listeners...');
        client.off('message.new');
        client.off('notification.message_new');
        client.disconnectUser().catch(console.error);
      }
    };
  }, []);

  const handleNewChat = () => {
    // Trigger a re-render of ChannelList
    setRefreshKey((prev) => prev + 1);
  };

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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Failed to connect to chat</p>
          <p className="text-sm text-gray-600">Please refresh the page and try again</p>
        </div>
      </div>
    );
  }

  const filters = { type: "messaging", members: { $in: [client.userID!] } };
  const sort = { last_message_at: -1 as const };
  const options = { limit: 10 };

  return (
    <div className="h-screen flex">
      <Chat client={client} theme="str-chat__theme-light">
        <div className="w-80 border-r flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="flex items-center gap-2">
              <NewChatDialog client={client} onChatCreated={handleNewChat} />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChannelList key={refreshKey} filters={filters} sort={sort} options={options} />
          </div>
        </div>
        <div className="flex-1">
          <ReplyContext.Provider value={{ quotedMessage, setQuotedMessage }}>
            <Channel Message={CustomMessage} QuotedMessage={CustomQuotedMessage}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <ReplyPreview />
                <MessageInput overrideSubmitHandler={overrideSubmitHandler} />
              </Window>
              <Thread />
            </Channel>
          </ReplyContext.Provider>
        </div>
      </Chat>
    </div>
  );
}
