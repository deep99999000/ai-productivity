import React from 'react';
import { useMessageContext, useChatContext } from 'stream-chat-react';
import { File, Image } from 'lucide-react';

export const CustomQuotedMessage = () => {
  const { message } = useMessageContext();
  const { client } = useChatContext();
  
  const quotedMessage = message.quoted_message;

  if (!quotedMessage) return null;

  const isMyMessage = message.user?.id === client.userID;
  const hasAttachments = quotedMessage.attachments && quotedMessage.attachments.length > 0;

  return (
    <div className={`
      relative flex flex-col gap-0.5 py-1 px-2 mb-1 border-l-[2.5px] text-left
      ${isMyMessage 
        ? 'border-blue-300' 
        : 'border-blue-500'
      }
    `}>
       <div className={`text-[13px] font-semibold ${isMyMessage ? 'text-blue-700' : 'text-blue-600'}`}>
         {quotedMessage.user?.name || quotedMessage.user?.id || 'You'}
       </div>
       
       {quotedMessage.text && (
          <div className={`text-[14px] line-clamp-2 break-words leading-tight ${isMyMessage ? 'text-blue-900/80' : 'text-gray-700'}`}>
              {quotedMessage.text}
          </div>
       )}

       {hasAttachments && (
         <div className={`flex items-center gap-1 mt-0.5 text-[11px] ${isMyMessage ? 'text-blue-600/70' : 'text-gray-500'}`}>
           {quotedMessage.attachments[0].type === 'image' ? <Image size={12} /> : <File size={12} />}
           <span>
             {quotedMessage.attachments.length > 1 
               ? `${quotedMessage.attachments.length} Files` 
               : 'Attachment'}
           </span>
         </div>
       )}
    </div>
  );
};
