import React from "react";

export default function MessageBubble({ m }) {
  const isOut = m.direction === "outbound" || m.direction === "out";
  const container = isOut ? "justify-end" : "justify-start";
  const bubbleStyle = isOut ? "bg-green-500 text-white" : "bg-white border";
  return (
    <div className={`flex ${container} mb-4`}>
      <div className={`rounded-2xl p-5 max-w-[70%] ${bubbleStyle}`}>
        <div className="whitespace-pre-wrap text-lg">{m.text}</div>
        <div className={`text-xs mt-3 ${isOut ? "text-green-100" : "text-gray-400"}`}>
          { new Date(m.timestamp).toLocaleString() } { isOut ? ` • ${m.status || ''}` : '' }
        </div>
      </div>
    </div>
  );
}
