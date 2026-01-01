import React, { useState } from 'react';
import { 
  useMessageInputContext, 
  useChannelStateContext,
} from 'stream-chat-react';
import { Smile } from 'lucide-react';
import { useReplyContext } from '../context/ReplyContext';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

export const CustomMessageInput = () => {
  const { handleSubmit, text = '', setText } = useMessageInputContext();
  const { channel } = useChannelStateContext();
  const { quotedMessage, setQuotedMessage } = useReplyContext();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setText(text + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!text?.trim()) return;

    try {
      await channel.sendMessage({
        text,
        quoted_message_id: quotedMessage?.id,
      });
      
      setText('');
      setQuotedMessage(undefined);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="str-chat__message-input">
      <div className="str-chat__message-input-inner">
        <div className="relative flex items-center gap-3 p-4 border-t border-zinc-100 bg-white">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-zinc-100 transition-colors"
            aria-label="Add emoji"
          >
            <Smile size={22} className="text-zinc-500" />
          </button>

          {/* Emoji Picker Dropdown */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-2 mb-2 z-50">
              <EmojiPicker onEmojiClick={handleEmojiSelect} />
            </div>
          )}

          {/* Text Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!text?.trim()}
            className="flex items-center justify-center px-5 py-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
