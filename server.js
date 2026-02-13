const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all routes (single-page app style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Full categories (server-side for secret word selection)
const categories = {
  food: ["Pizza", "Burger", "Sushi", "Tacos", "Pasta", "Ramen", "Curry", "Pho", "Dim Sum", "Paella", "Butter Chicken", "Pad Thai", "Lasagna", "Burrito", "Falafel", "Shawarma", "Kebab", "Poutine", "Fish & Chips", "Bangers & Mash", "Pie Floater", "Hamburger", "Hot Dog", "Nachos", "Quesadilla", "Enchilada", "Chimichanga", "Biryani", "Laksa", "Tom Yum", "Satay", "Spring Rolls", "Dumplings", "Gyros", "Souvlaki", "Pierogi", "Ceviche", "Poke Bowl", "Bibimbap", "Katsu Curry", "Carbonara", "Risotto", "Tagine", "Jollof Rice", "Feijoada", "Empanada", "Schnitzel", "Paella", "Goulash"],
  movies: ["The Lion King", "Frozen", "Toy Story", "Finding Nemo", "The Incredibles", "Moana", "Encanto", "Coco", "Inside Out", "Up", "Wall-E", "Ratatouille", "The Avengers", "Spider-Man", "Batman", "Harry Potter", "Star Wars", "Jurassic Park", "Titanic", "Forrest Gump", "The Matrix", "Inception", "Pulp Fiction", "The Godfather", "Jaws", "E.T.", "Back to the Future", "Indiana Jones", "Ghostbusters", "Grease", "The Sound of Music", "Beauty and the Beast", "Aladdin", "The Little Mermaid", "Shrek", "Kung Fu Panda", "Despicable Me", "Minions", "Cars", "Monsters Inc", "Zootopia", "Big Hero 6", "Wreck-It Ralph", "Tangled", "Brave", "The Princess and the Frog", "Mulan", "Hercules", "Cinderella", "Snow White"],
  jobs_professions: ["Doctor", "Teacher", "Police Officer", "Firefighter", "Nurse", "Chef", "Pilot", "Astronaut", "Farmer", "Mechanic", "Builder", "Dentist", "Veterinarian", "Artist", "Musician", "Actor", "Scientist", "Engineer", "Lawyer", "Journalist", "Photographer", "Waiter", "Barber", "Hairdresser", "Plumber", "Electrician", "Carpenter", "Gardener", "Bus Driver", "Train Driver", "Postman", "Baker", "Florist", "Librarian", "Accountant", "Programmer", "Designer", "Athlete", "Coach", "Referee", "Clown", "Magician", "Detective", "Spy", "Soldier", "Sailor", "Fisherman", "Truck Driver", "Taxi Driver", "Flight Attendant"],
  animals: ["Dog", "Cat", "Elephant", "Giraffe", "Lion", "Tiger", "Bear", "Monkey", "Panda", "Kangaroo", "Koala", "Zebra", "Horse", "Cow", "Pig", "Sheep", "Goat", "Chicken", "Duck", "Rabbit", "Squirrel", "Fox", "Wolf", "Deer", "Hedgehog", "Otter", "Seal", "Walrus", "Penguin", "Flamingo", "Peacock", "Parrot", "Eagle", "Owl", "Bat", "Snake", "Lizard", "Turtle", "Frog", "Crocodile", "Shark", "Dolphin", "Whale", "Octopus", "Jellyfish", "Butterfly", "Bee", "Ant", "Spider"],
  // ... (add remaining categories if needed; this is a subset for brevity but matches your logs/setup)
  // In production, paste your full list here
};

const rooms = {}; // code → {secret, players: [{id, name, seen}], status, host, imposter}

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('createRoom', ({ name, category }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const wordList = categories[category] || categories.food;
    const secret = wordList[Math.floor(Math.random() * wordList.length)];

    rooms[code] = {
      secret,
      players: [{ id: socket.id, name, seen: false }],
      status: 'lobby',
      host: socket.id,
      imposter: null
    };

    socket.join(code);
    socket.emit('roomCreated', { code });
    io.to(code).emit('playersUpdate', rooms[code].players);
  });

  socket.on('joinRoom', ({ code, name }) => {
    code = code.toUpperCase();
    const room = rooms[code];
    if (!room) return socket.emit('error', 'Room not found');
    if (room.players.some(p => p.name === name)) return socket.emit('error', 'Name taken');

    room.players.push({ id: socket.id, name, seen: false });
    socket.join(code);
    io.to(code).emit('playersUpdate', room.players);
    socket.emit('joined', { code });
  });

  socket.on('markSeen', (code) => {
    code = code.toUpperCase();
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) player.seen = true;

    io.to(code).emit('playersUpdate', room.players);

    if (room.players.length >= 3 && room.players.every(p => p.seen)) {
      room.imposter = Math.floor(Math.random() * room.players.length);
      room.status = 'playing';
      io.to(code).emit('gameStarted', {
        imposterIndex: room.imposter,
        secret: room.secret
      });
    }
  });

  socket.on('reveal', (code) => {
    code = code.toUpperCase();
    const room = rooms[code];
    if (!room || socket.id !== room.host) return socket.emit('error', 'Host only');

    io.to(code).emit('gameRevealed', {
      imposterName: room.players[room.imposter].name,
      secret: room.secret
    });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });

  socket.on('ping', () => {}); // For heartbeat
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
