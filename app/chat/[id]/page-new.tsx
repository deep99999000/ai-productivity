"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { use } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Bell, BellOff } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

interface Message {
  id: string;
  roomId: string;
  sender: string;
  text: string;
  createdAt: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sender, setSender] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  // Simple notification function that ALWAYS works
  const showNotification = useCallback((message: Message) => {
    if (message.sender === sender) return; // Don't notify own messages
    
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(`💬 ${message.sender}`, {
          body: message.text,
          icon: "/favicon.ico",
          tag: `chat-${Date.now()}-${Math.random()}`,
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        setTimeout(() => notification.close(), 5000);
      } catch (e) {
        console.log("Notification failed:", e);
      }
    }
    
    toast(`${message.sender}: ${message.text}`, {
      duration: 3000,
      position: 'top-right',
    });
  }, [sender]);

  // Request notification permission
  const requestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
      if (permission === "granted") {
        toast.success("Notifications enabled!");
      }
    }
  };

  // Check permission on load
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Socket connection
  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    const SOCKET_URL = isProd ? process.env.NEXT_PUBLIC_SOCKET_URL : 'http://localhost:3000';

    if (isProd && !SOCKET_URL) {
      console.warn('NEXT_PUBLIC_SOCKET_URL is not set. Socket will try to connect to current origin, which will fail on Vercel.');
    }

    const socketIO = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    
    socketIO.on("connect", () => {
      setIsConnected(true);
      socketIO.emit("join-room", roomId);
    });

    socketIO.on("disconnect", () => {
      setIsConnected(false);
    });

    socketIO.on("new-message", (message: Message) => {
      setMessages(prev => [...prev, message]);
      showNotification(message);
    });

    setSocket(socketIO);
    return () => {
      socketIO.disconnect();
    };
  }, [roomId, showNotification]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${roomId}`);
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [roomId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sender.trim()) return;

    try {
      const response = await fetch(`/api/chat/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: sender.trim(),
          text: newMessage.trim(),
        }),
      });

      const data = await response.json();
      if (data.message && socket) {
        socket.emit("send-message", { roomId, message: data.message });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!sender) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h1 className="text-2xl font-bold text-white mb-2">Chat Room {roomId}</h1>
            <p className="text-gray-400">Enter your name to start chatting</p>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Your name..."
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setSender(sender.trim())}
              className="bg-gray-800 border-gray-700 text-white text-lg h-12"
            />
            <Button 
              onClick={() => { setSender(sender.trim()); requestPermission(); }}
              disabled={!sender.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
            >
              Join Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-blue-500" />
          <div>
            <h1 className="text-white font-semibold">Room {roomId}</h1>
            <p className="text-gray-400 text-sm">
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={notificationsEnabled ? () => {} : requestPermission}
          className="text-white hover:bg-gray-700"
        >
          {notificationsEnabled ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === sender ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm px-4 py-2 rounded-lg ${
                message.sender === sender
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}>
                <div className="text-sm font-medium mb-1 opacity-75">
                  {message.sender}
                </div>
                <div className="text-sm">{message.text}</div>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className="flex-1 bg-gray-700 border-gray-600 text-white"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • {isConnected ? 'Connected' : 'Reconnecting...'}
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
