"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { getOrCreateDirectMessageByEmail } from "../actions";
import { toast } from "react-hot-toast";
import type { StreamChat } from "stream-chat";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewChatDialogProps {
  client: StreamChat;
  onChatCreated?: () => void;
}

export default function NewChatDialog({ client, onChatCreated }: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleStartChat = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Create or get direct message channel using email
      const { channelId, otherUserName } = await getOrCreateDirectMessageByEmail(email);

      // Watch the channel to make it active
      const channel = client.channel("messaging", channelId);
      await channel.watch();

      toast.success(`Chat started with ${otherUserName}!`);
      setOpen(false);
      setEmail("");
      
      // Trigger refresh callback
      onChatCreated?.();
    } catch (error) {
      console.error("Error starting chat:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start chat. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              handleStartChat();
            }
          }}
          className="h-11 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
        />
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5 text-gray-600" />
      </button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>New Chat</DrawerTitle>
              <DrawerDescription>
                Enter the email address of the person you want to chat with.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              {formContent}
            </div>
            <DrawerFooter className="pt-2">
              <Button onClick={handleStartChat} disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Chat"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Chat</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to chat with.
              </DialogDescription>
            </DialogHeader>
            {formContent}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEmail("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleStartChat} disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Chat"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
