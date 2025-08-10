export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/conversations`);
  return res.json();
}

export async function fetchMessages(wa_id) {
  const res = await fetch(`${API_BASE}/conversations/${encodeURIComponent(wa_id)}/messages`);
  return res.json();
}

export async function postMessage(payload) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
