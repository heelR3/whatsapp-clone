import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { fetchConversations, fetchMessages, postMessage } from "./api";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function App() {
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const socketRef = useRef(null);

  // Initialize socket once & initial conversations
  useEffect(() => {
    // initial load of conversations
    (async () => {
      try {
        const data = await fetchConversations();
        setConvs(data);
        if (!active && data.length) setActive(data[0]);
      } catch (e) { console.error('loadConvs', e); }
    })();

    // create socket once
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("socket connected", socketRef.current.id);
    });

    socketRef.current.on("receiveMessage", (msg) => {
      // update conversation preview (lastMessage + timestamp)
      setConvs(prev => {
        // if conversation exists -> update lastMessage/lastTimestamp
        const exists = prev.find(c => c._id === msg.wa_id);
        if (exists) {
          return prev.map(c => c._id === msg.wa_id ? { ...c, lastMessage: msg.text, lastTimestamp: msg.timestamp } : c);
        } else {
          // insert new conversation at top
          return [{ _id: msg.wa_id, name: msg.name || msg.wa_id, number: msg.number || '', lastMessage: msg.text, lastTimestamp: msg.timestamp }, ...prev];
        }
      });

      // if active chat matches incoming msg -> append to messages
      setMsgs(prev => (active && msg.wa_id === active._id) ? [...prev, msg] : prev);
    });

    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // load messages whenever active changes
  useEffect(() => {
    if (!active) { setMsgs([]); return; }
    (async () => {
      try {
        const m = await fetchMessages(active._id);
        setMsgs(m);
      } catch (e) { console.error(e); }
    })();
  }, [active]);

  // send message using REST (server will broadcast saved message)
  async function handleSend(text) {
    if (!text || !active) return;
    const payload = { wa_id: active._id, name: active.name || '', number: active.number || '', text, direction: 'outbound' };

    // optimistic update
    const local = { ...payload, _id: 'local-' + Date.now(), timestamp: new Date().toISOString(), status: 'sent' };
    setMsgs(prev => [...prev, local]);
    setConvs(prev => prev.map(c => c._id === active._id ? { ...c, lastMessage: text, lastTimestamp: new Date() } : c));

    try {
      await postMessage(payload); // when saved, backend emits and other tabs will receive the true saved message
    } catch (e) {
      console.error('postMessage failed', e);
    }
  }

  return (
    <div className="flex h-screen">
      <ChatList convs={convs} activeId={active?._id} onSelect={(c)=> setActive(c)} />
      <ChatWindow active={active} messages={msgs} onSend={handleSend} />
    </div>
  );
}
