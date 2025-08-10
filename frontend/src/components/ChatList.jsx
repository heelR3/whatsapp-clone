import React from "react";

export default function ChatList({ convs, onSelect, activeId }) {
  return (
    <aside className="w-80 bg-white border-r">
      <div className="p-4 text-2xl font-bold">WhatsApp Clone</div>
      <div className="overflow-auto h-[calc(100vh-64px)]">
        {convs.map(c => (
          <div key={c._id} onClick={() => onSelect(c)} className={`p-4 cursor-pointer border-b hover:bg-gray-50 flex justify-between ${activeId === c._id ? 'bg-gray-100' : ''}`}>
            <div>
              <div className="font-medium">{c.name || c._id}</div>
              <div className="text-sm text-gray-500 truncate w-56">{c.lastMessage || ''}</div>
            </div>
            <div className="text-xs text-gray-400">{c.lastTimestamp ? new Date(c.lastTimestamp).toLocaleTimeString() : ''}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
