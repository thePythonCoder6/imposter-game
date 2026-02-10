const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }  // change to your Render URL later
});

// Serve your HTML file
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Game state (simple in-memory)
const rooms = {};  // roomCode → {secret, imposter, players: [], status, ...}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('create', (data) => {
    const code = Math.random().toString(36).substring(2,8).toUpperCase();
    const secret = "Pizza"; // ← replace with real random from category later

    rooms[code] = {
      secret: secret,
      players: [{id: socket.id, name: data.name, seen: false}],
      status: 'lobby',
      host: socket.id
    };

    socket.join(code);
    socket.emit('room', code);
    io.to(code).emit('players', rooms[code].players);
  });

  socket.on('join', (data) => {
    const room = rooms[data.code];
    if (!room) return socket.emit('error', 'No room');

    room.players.push({id: socket.id, name: data.name, seen: false});
    socket.join(data.code);
    io.to(data.code).emit('players', room.players);
  });

  socket.on('seen', (code) => {
    const room = rooms[code];
    if (!room) return;

    const p = room.players.find(pl => pl.id === socket.id);
    if (p) p.seen = true;

    io.to(code).emit('players', room.players);

    // If all seen → start
    if (room.players.length >= 3 && room.players.every(pl => pl.seen)) {
      room.imposter = Math.floor(Math.random() * room.players.length);
      room.status = 'playing';
      io.to(code).emit('start', { imposter: room.imposter, secret: room.secret });
    }
  });

  socket.on('reveal', (code) => {
    const room = rooms[code];
    if (socket.id !== room.host) return;
    io.to(code).emit('end', { imposterName: room.players[room.imposter].name, secret: room.secret });
  });

  socket.on('disconnect', () => {
    console.log('Player left:', socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Running on port ${port}`);
});
