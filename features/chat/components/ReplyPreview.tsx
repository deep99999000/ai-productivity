import React from 'react';
import { MessageResponse } from 'stream-chat';
import { X } from 'lucide-react';
import { useReplyContext } from '../context/ReplyContext';

export const ReplyPreview = () => {
  const { quotedMessage, setQuotedMessage } = useReplyContext();

  if (!quotedMessage) return null;

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-x rounded-t-md mx-2 mt-2 min-h-[60px] max-h-[80px]">
      <div className="flex flex-col text-sm border-l-2 border-blue-500 pl-2 flex-1 overflow-hidden">
        <span className="font-semibold text-blue-600 truncate">
          Reply to {quotedMessage.user?.name || 'User'}
        </span>
        <span className="text-gray-600 line-clamp-2 break-words text-xs leading-tight">
          {quotedMessage.text}
        </span>
      </div>
      <button
        onClick={() => setQuotedMessage(undefined)}
        className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 ml-2"
      >
        <X size={16} className="text-gray-500" />
      </button>
    </div>
  );
};
