import React, { useState } from "react";

export default function SendBox({ onSend }) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <div className="flex gap-3 items-center">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") send(); }}
        className="flex-1 border rounded-full px-6 py-3 focus:outline-none"
        placeholder="Type a message"
      />
      <button onClick={send} className="bg-green-500 text-white px-6 py-2 rounded-full">Send</button>
    </div>
  );
}
