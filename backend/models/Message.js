const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  wa_id: { type: String, index: true },      // contact id (phone)
  name: String,
  number: String,
  message_id: { type: String, index: true },
  meta_msg_id: String,
  text: String,
  direction: { type: String, enum: ['inbound','outbound'], default: 'inbound' },
  status: { type: String, enum: ['sent','delivered','read','unknown'], default: 'sent' },
  timestamp: { type: Date, default: Date.now },
  raw: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema, 'processed_messages');
