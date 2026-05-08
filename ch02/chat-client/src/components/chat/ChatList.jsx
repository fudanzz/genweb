import ChatMessage from './ChatMessage';
import ChatBubbleLoading from './ChatBubbleLoading';

const ChatList = ({ messages, isLoading }) => {
  console.debug(messages);
  return (
    <ul className="flex flex-col gap-5">
      {messages.map((message) => (
        <li key={message?.id}>
          <ChatMessage
            role={message.role}
            text={message.content}
            className={`${message.role === 'assistant' ? 'mr-auto' : 'ml-auto'} border-none`}
          />
        </li>
      ))}
      {isLoading ? (
        <li key={messages.length + 1}>
          <ChatBubbleLoading />
        </li>
      ) : null}
    </ul>
  );
};

export default ChatList;
