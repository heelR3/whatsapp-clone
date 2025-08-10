const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/conversations
router.get('/conversations', async (req, res) => {
  try {
    const convs = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
         _id: "$wa_id",
         name: { $first: "$name" },
         number: { $first: "$number" },
         lastMessage: { $first: "$text" },
         lastStatus: { $first: "$status" },
         lastTimestamp: { $first: "$timestamp" }
      }},
      { $sort: { lastTimestamp: -1 } }
    ]);
    res.json(convs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conversations/:wa_id/messages
router.get('/conversations/:wa_id/messages', async (req, res) => {
  try {
    const wa_id = req.params.wa_id;
    const msgs = await Message.find({ wa_id }).sort({ timestamp: 1 }).lean();
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/messages.js (POST /api/messages)
router.post('/messages', async (req, res) => {
  try {
    const { wa_id, name, number, text, direction } = req.body;
    const msg = new Message({
      wa_id,
      name,
      number,
      message_id: `local-${Date.now()}`,
      text,
      direction: direction || 'outbound',
      status: 'sent',
      timestamp: new Date(),
      raw: req.body
    });
    const saved = await msg.save();

    // broadcast the saved message to everyone
    const io = req.app.locals.io;
    if (io) io.emit('receiveMessage', saved);

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
