import React from 'react';
import { MessageSimple, useMessageContext, MessageProvider } from 'stream-chat-react';
import { useReplyContext } from '../context/ReplyContext';

export const CustomMessage = (props: any) => {
  const messageContext = useMessageContext();
  const { setQuotedMessage } = useReplyContext();

  const handleOpenThread = (e: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setQuotedMessage(props.message || messageContext.message);
  };

  const newMessageContext = {
    ...messageContext,
    handleOpenThread,
  };

  return (
    <MessageProvider value={newMessageContext}>
      <MessageSimple {...props} handleOpenThread={handleOpenThread} />
    </MessageProvider>
  );
};
