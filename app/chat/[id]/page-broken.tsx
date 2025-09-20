"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Bell, BellOff, Phone, Video, Camera, Smile, Heart } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { API } from "@/lib/actions/getbackendurl";

interface Message {
  id: string;
  roomId: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface MessagePayload {
  message?: Message;
  id?: string;
  roomId?: string;
  sender?: string;
  text?: string;
  createdAt?: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sender, setSender] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

    // Check notification permission on mount and periodically - AGGRESSIVE CHECKING
  useEffect(() => {
    const checkPermission = () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = Notification.permission;
        const hasPerms = permission === "granted";
        
        console.log("🔍 Permission check:", permission, "Has permission:", hasPerms);
        
        setHasPermission(hasPerms);
        
        // Auto-enable notifications if we have permission
        if (hasPerms) {
          setNotificationsEnabled(true);
          console.log("✅ Auto-enabled notifications");
        } else {
          setNotificationsEnabled(false);
          console.log("❌ Disabled notifications (no permission)");
        }
      }
    };

    checkPermission();
    
    // Check permission every 1 second for immediate response
    const interval = setInterval(checkPermission, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Request notification permission when user clicks enable button
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Notifications not supported in this browser");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === "granted");
      setNotificationsEnabled(permission === "granted");
      
      if (permission === "granted") {
        toast.success("Notifications enabled!");
        // Send a test notification
        testNotification();
      } else if (permission === "denied") {
        toast.error("Notifications blocked. Enable in browser settings.");
      }
    } catch (err) {
      console.error("Notification permission error:", err);
      toast.error("Failed to request notification permission");
    }
  };

  // Test notification function
  const testNotification = () => {
    console.log("🧪 Testing notification, hasPermission:", hasPermission);
    
    if (!hasPermission) {
      toast.error("No notification permission!");
      return;
    }
    
    try {
      const uniqueTag = `test-${Date.now()}-${Math.random()}`;
      const notification = new Notification("🧪 Test Notification", {
        body: "If you see this, notifications are working perfectly!",
        icon: "/favicon.ico",
        tag: uniqueTag,
        requireInteraction: false,
      });
      
      console.log("✅ Test notification created with tag:", uniqueTag);
      
      setTimeout(() => {
        notification.close();
        console.log("🧪 Test notification closed");
      }, 3000);
      
      toast.success("Test notification sent!");
      
    } catch (error) {
      console.error("❌ Failed to send test notification:", error);
      toast.error("Failed to send test notification");
    }
  };

  // Force multiple test notifications
  const testMultipleNotifications = () => {
    console.log("🎯 Testing multiple notifications");
    for (let i = 1; i <= 3; i++) {
      setTimeout(() => {
        const notification = new Notification(`🔥 Test ${i}/3`, {
          body: `Testing notification #${i} - should see all 3!`,
          icon: "/favicon.ico",
          tag: `multi-test-${Date.now()}-${i}`,
        });
        setTimeout(() => notification.close(), 4000);
        console.log(`✅ Multi-test notification ${i} sent`);
      }, i * 500);
    }
  };

  // Show notification for new messages - FIRES FOR EVERY MESSAGE
  const showNotification = (message: Message) => {
    console.log("🔔 Attempting notification for:", message.sender, message.text);
    
    // Check if notifications are available
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("❌ Notifications not supported");
      return;
    }
    
    // Don't notify for own messages
    if (message.sender === sender) {
      console.log("❌ Skipping own message");
      return;
    }
    
    // Check permission
    if (Notification.permission !== "granted") {
      console.log("❌ No permission, current:", Notification.permission);
      return;
    }
    
    // Force notification enabled if we have permission
    if (!notificationsEnabled && hasPermission) {
      setNotificationsEnabled(true);
    }
    
    try {
      console.log("✅ Creating notification for:", message.sender);
      
      // Create notification with completely unique tag every time
      const uniqueId = `msg-${message.id || Date.now()}-${Math.random()}`;
      
      // Enhanced notification with quick reply feature
      const notification = new Notification(`💬 ${message.sender}`, {
        body: `${message.text}\n\n👆 Click to reply instantly`,
        icon: "/favicon.ico",
        tag: uniqueId,
        badge: "/favicon.ico",
        requireInteraction: false,
        silent: false,
      });
      
      console.log("🎯 Enhanced notification created with tag:", uniqueId);
      
      notification.onclick = () => {
        console.log("🖱️ Notification clicked - quick reply mode");
        window.focus();
        
        // Focus on message input for quick reply
        setTimeout(() => {
          const messageInput = document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement;
          if (messageInput) {
            messageInput.focus();
            // Pre-fill with @mention
            if (!messageInput.value.startsWith(`@${message.sender} `)) {
              messageInput.value = `@${message.sender} `;
              setNewMessage(`@${message.sender} `);
            }
          }
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        
        notification.close();
      };
      
      notification.onshow = () => {
        console.log("👀 Notification shown with reply actions");
      };
      
      notification.onerror = (e) => {
        console.log("❌ Notification error:", e);
      };
      
      // Auto close after 10 seconds (longer for interaction)
      setTimeout(() => {
        try {
          notification.close();
          console.log("⏰ Notification auto-closed");
        } catch (e) {
          console.log("Error closing notification:", e);
        }
      }, 10000);
      
    } catch (error) {
      console.error("❌ Failed to show notification:", error);
      // Always show toast as fallback
      toast(`💬 ${message.sender}: ${message.text}`, {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const socketIO = io(API);
    
    socketIO.on("connect", () => {
      setIsConnected(true);
      socketIO.emit("join-room", roomId);
    });

    socketIO.on("disconnect", () => {
      setIsConnected(false);
    });

    socketIO.on("new-message", (payload: MessagePayload) => {
      const message: Message = payload && payload.message ? payload.message : payload as Message;
      console.log("📨 Received new message:", message);

      // Add message to state
      setMessages(prev => [...prev, message]);
      
      // ALWAYS try to show notification for incoming messages
      showNotification(message);
      
      // ALWAYS show toast notification as well (double notification system)
      if (message.sender !== sender) {
        toast(`💬 ${message.sender}: ${message.text}`, {
          duration: 3000,
          position: 'top-right',
        });
        console.log("🍞 Toast shown for message from:", message.sender);
      }
    });

    setSocket(socketIO);

    return () => {
      socketIO.disconnect();
    };
  }, [roomId, sender, showNotification]);

  // Fetch existing messages
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

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sender.trim()) return;

    try {
      const response = await fetch(`/api/chat/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const onJoin = async () => {
    const name = sender.trim();
    if (!name) return;
    setSender(name);
    await requestNotificationPermission();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto border-x border-gray-800">
      {/* Instagram-style Header */}
      <div className="bg-black border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {roomId.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-white font-semibold text-base">Room {roomId}</h1>
              <p className="text-gray-400 text-xs">
                {isConnected ? 'Active now' : 'Connecting...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sender && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={hasPermission ? () => setNotificationsEnabled(!notificationsEnabled) : requestNotificationPermission}
                  className="p-2 text-white hover:bg-gray-800"
                >
                  {hasPermission && notificationsEnabled ? (
                    <Bell className="h-5 w-5" />
                  ) : (
                    <BellOff className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost" 
                  size="sm"
                  className="p-2 text-white hover:bg-gray-800"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm" 
                  className="p-2 text-white hover:bg-gray-800"
                >
                  <Video className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Name Input - Instagram Style */}
      {!sender && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">Join Room {roomId}</h2>
              <p className="text-gray-400 text-sm">Enter your name to start chatting</p>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Your name..."
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onJoin(); } }}
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 rounded-lg h-12"
              />
              <Button 
                onClick={onJoin}
                disabled={!sender.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-12 rounded-lg"
              >
                Join Chat
              </Button>
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied' && (
                <p className="text-xs text-red-400 text-center">Enable notifications for message alerts</p>
              )}
            </div>
          </div>
        </div>
      )}

      {sender && (
        <>
          {/* Messages Area - Instagram Style */}
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-black">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <p className="text-sm">No messages yet</p>
                <p className="text-xs text-gray-600">Send a message to start the conversation</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === sender ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs flex ${message.sender === sender ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {message.sender.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`px-4 py-2 rounded-2xl ${
                        message.sender === sender
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-800 text-white rounded-bl-md border border-gray-700'
                      }`}>
                        <div className="text-sm leading-relaxed">{message.text}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === sender ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input - Instagram Style */}
          <div className="border-t border-gray-800 bg-black px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
              >
                <Camera className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 rounded-full pr-20 h-10"
                />
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 text-gray-400 hover:text-white rounded-full"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  {newMessage.trim() ? (
                    <Button
                      onClick={handleSendMessage}
                      disabled={!isConnected}
                      size="sm"
                      className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full"
                    >
                      <Send className="h-4 w-4 text-white" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-blue-400 hover:text-blue-300 rounded-full"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {hasPermission && (
              <div className="flex justify-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  onClick={testNotification}
                  className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
                >
                  Test Notification
                </Button>
                <Button
                  variant="ghost"
                  onClick={testMultipleNotifications}
                  className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
                >
                  Test Multiple
                </Button>
              </div>
            )}
          </div>
        </>
      )}
      
      <Toaster position="top-center" 
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#ffffff',
            border: '1px solid #374151'
          }
        }}
      />
    </div>
  );
}
