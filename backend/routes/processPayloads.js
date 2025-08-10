const express = require('express');
const fs = require('fs');
const path = require('path');
const Message = require('../models/Message');
const router = express.Router();

function safeNumToDate(ts) {
  const n = Number(ts);
  if (!n) return new Date();
  return (n < 1e12) ? new Date(n * 1000) : new Date(n);
}

router.post('/process', async (req, res) => {
  try {
    // process either passed payload (req.body) or files in payloads folder
    if (req.body && Object.keys(req.body).length) {
      await processPayload(req.body);
      return res.json({ message: 'Processed payload from body' });
    }

    const payloadDir = path.join(__dirname, '..', 'payloads');
    if (!fs.existsSync(payloadDir)) {
      return res.status(400).json({ error: 'No payloads folder found' });
    }
    const files = fs.readdirSync(payloadDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const raw = fs.readFileSync(path.join(payloadDir, f), 'utf8');
      const payload = JSON.parse(raw);
      await processPayload(payload);
    }
    res.json({ message: 'Payloads processed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function processPayload(payload) {
  // supports the sample structure you provided
  const meta = payload.metaData || payload.meta_data || payload.meta || payload;
  const entries = (meta && meta.entry) || (payload.entry && payload.entry) || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const ch of changes) {
      const value = ch.value || ch.payload || {};
      // messages
      if (Array.isArray(value.messages)) {
        for (const m of value.messages) {
          const name = value.contacts?.[0]?.profile?.name || null;
          const wa_id = value.contacts?.[0]?.wa_id || m.from || m.to || 'unknown';
          const msgId = m.id || m.message_id || m.mid || `m-${Date.now()}`;
          const text = (m.text && m.text.body) || m.body || '';
          const timestamp = safeNumToDate(m.timestamp);
          await Message.updateOne(
            { message_id: msgId },
            { $setOnInsert: {
                wa_id, name, number: m.from || m.to || wa_id,
                message_id: msgId, meta_msg_id: m.meta_msg_id || null,
                text, direction: (m.from && String(m.from).includes(value?.metadata?.display_phone_number)) ? 'outbound' : (m.from === wa_id ? 'inbound' : 'inbound'),
                status: 'sent', timestamp, raw: m
              }
            },
            { upsert: true }
          );
        }
      }

      // statuses
      if (Array.isArray(value.statuses)) {
        for (const s of value.statuses) {
          const mid = s.id || s.meta_msg_id || s.message_id;
          const status = s.status || 'unknown';
          const ts = safeNumToDate(s.timestamp);
          await Message.findOneAndUpdate(
            { $or: [{ message_id: mid }, { meta_msg_id: mid }] },
            { $set: { status, status_updated_at: ts, 'raw.last_status': s } }
          );
        }
      }
    }
  }
}

module.exports = router;
