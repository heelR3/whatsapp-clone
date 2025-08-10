import React from "react";
import MessageBubble from "./MessageBubble";
import SendBox from "./SendBox";

export default function ChatWindow({ active, messages, onSend }) {
  if (!active) return <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat</div>;

  return (
    <div className="flex-1 flex flex-col">
      <header className="p-4 border-b bg-white">
        <div className="text-lg font-semibold">{active.name || active._id}</div>
        <div className="text-sm text-gray-500">{active.number}</div>
      </header>

      <div className="flex-1 p-6 overflow-auto bg-gray-50" id="chatBody">
        <div className="max-w-3xl mx-auto">
          {messages.map(m => <MessageBubble key={m._id || m.message_id} m={m} />)}
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <SendBox onSend={onSend} />
      </div>
    </div>
  );
}
