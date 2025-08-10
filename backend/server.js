// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const messagesRoutes = require('./routes/messages'); // your routes file
const processRoutes = require('./routes/processPayloads');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || "*", methods: ["GET", "POST"] }
});


// make io available to routes via app.locals
app.locals.io = io;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(()=> console.log('MongoDB Connected'))
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api', messagesRoutes);
app.use('/api', processRoutes);

app.get('/', (req, res)=> res.send('WhatsApp clone backend'));

// Socket listeners (optional)
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
