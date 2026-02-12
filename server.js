const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',  // For testing; change to your Render URL in production, e.g. 'https://imposter-game-t46b.onrender.com'
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,    // Increase timeout tolerance (helps on Render free)
  pingInterval: 25000
});

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// In-memory rooms (lost on restart – fine for casual play)
const rooms = {};  // code → { secret, imposter, players: [{id, name, seen}], status, host }

// Sample categories (expand as needed)
const categories = {
  food: ['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pasta', 'Ice Cream', 'Curry', 'Pancakes', 'Ramen', 'Salad'],
  animals: ['Dog', 'Cat', 'Elephant', 'Giraffe', 'Lion', 'Tiger', 'Panda', 'Penguin', 'Koala', 'Dolphin'],
  movies: ['Frozen', 'Toy Story', 'The Lion King', 'Moana', 'Encanto', 'Shrek', 'Kung Fu Panda', 'Inside Out', 'Up', 'Coco']
};

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('create', ({ name, category }) => {
    if (!categories[category]) return socket.emit('error', 'Invalid category');

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const wordList = categories[category];
    const secret = wordList[Math.floor(Math.random() * wordList.length)];

    rooms[code] = {
      secret,
      imposter: null,
      players: [{ id: socket.id, name, seen: false }],
      status: 'lobby',
      host: socket.id
    };

    socket.join(code);
    socket.emit('roomCreated', { code });
    io.to(code).emit('playersUpdate', rooms[code].players);
  });

  socket.on('join', ({ code, name }) => {
    const room = rooms[code.toUpperCase()];
    if (!room) return socket.emit('error', 'Room not found');
    if (room.players.some(p => p.name === name)) return socket.emit('error', 'Name taken');

    room.players.push({ id: socket.id, name, seen: false });
    socket.join(code);
    io.to(code).emit('playersUpdate', room.players);
    socket.emit('joined', { code });
  });

  socket.on('markSeen', (code) => {
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) player.seen = true;

    io.to(code).emit('playersUpdate', room.players);

    // Auto-start when all have seen (≥3 players)
    if (room.players.length >= 3 && room.players.every(p => p.seen)) {
      room.imposter = Math.floor(Math.random() * room.players.length);
      room.status = 'playing';
      io.to(code).emit('gameStart', {
        imposterIndex: room.imposter,
        secret: room.secret
      });
    }
  });

  socket.on('reveal', (code) => {
    const room = rooms[code];
    if (!room || socket.id !== room.host) return socket.emit('error', 'Not allowed');

    room.status = 'ended';
    io.to(code).emit('gameEnd', {
      imposterName: room.players[room.imposter].name,
      secret: room.secret
    });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
