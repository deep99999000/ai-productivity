import { createContext, useContext } from 'react';
import { MessageResponse, StreamChat } from 'stream-chat';

type ReplyContextType = {
  quotedMessage: any | undefined;
  setQuotedMessage: (message: any | undefined) => void;
};

export const ReplyContext = createContext<ReplyContextType>({
  quotedMessage: undefined,
  setQuotedMessage: () => {},
});

export const useReplyContext = () => useContext(ReplyContext);
