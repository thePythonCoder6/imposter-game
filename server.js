const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',                      // ← change to your actual Render URL in production
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,                 // Helps Render free-tier connections stay alive longer
  pingInterval: 25000
});

// Serve static files (the client HTML/JS/CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route → serve index.html for any path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Full categories object (copied from your original local version)
const categories = {
  food: ["Pizza", "Burger", "Sushi", "Tacos", "Pasta", "Ramen", "Curry", "Pho", "Dim Sum", "Paella", "Butter Chicken", "Pad Thai", "Lasagna", "Burrito", "Falafel", "Shawarma", "Kebab", "Poutine", "Fish & Chips", "Bangers & Mash", "Pie Floater", "Hamburger", "Hot Dog", "Nachos", "Quesadilla", "Enchilada", "Chimichanga", "Biryani", "Laksa", "Tom Yum", "Satay", "Spring Rolls", "Dumplings", "Gyros", "Souvlaki", "Pierogi", "Ceviche", "Poke Bowl", "Bibimbap", "Katsu Curry", "Carbonara", "Risotto", "Tagine", "Jollof Rice", "Feijoada", "Empanada", "Schnitzel", "Paella", "Goulash"],
  movies: ["The Lion King", "Frozen", "Toy Story", "Finding Nemo", "The Incredibles", "Moana", "Encanto", "Coco", "Inside Out", "Up", "Wall-E", "Ratatouille", "The Avengers", "Spider-Man", "Batman", "Harry Potter", "Star Wars", "Jurassic Park", "Titanic", "Forrest Gump", "The Matrix", "Inception", "Pulp Fiction", "The Godfather", "Jaws", "E.T.", "Back to the Future", "Indiana Jones", "Ghostbusters", "Grease", "The Sound of Music", "Beauty and the Beast", "Aladdin", "The Little Mermaid", "Shrek", "Kung Fu Panda", "Despicable Me", "Minions", "Cars", "Monsters Inc", "Zootopia", "Big Hero 6", "Wreck-It Ralph", "Tangled", "Brave", "The Princess and the Frog", "Mulan", "Hercules", "Cinderella", "Snow White"],
  jobs_professions: ["Doctor", "Teacher", "Police Officer", "Firefighter", "Nurse", "Chef", "Pilot", "Astronaut", "Farmer", "Mechanic", "Builder", "Dentist", "Veterinarian", "Artist", "Musician", "Actor", "Scientist", "Engineer", "Lawyer", "Journalist", "Photographer", "Waiter", "Barber", "Hairdresser", "Plumber", "Electrician", "Carpenter", "Gardener", "Bus Driver", "Train Driver", "Postman", "Baker", "Florist", "Librarian", "Accountant", "Programmer", "Designer", "Athlete", "Coach", "Referee", "Clown", "Magician", "Detective", "Spy", "Soldier", "Sailor", "Fisherman", "Truck Driver", "Taxi Driver", "Flight Attendant"],
  animals: ["Dog", "Cat", "Elephant", "Giraffe", "Lion", "Tiger", "Bear", "Monkey", "Panda", "Kangaroo", "Koala", "Zebra", "Horse", "Cow", "Pig", "Sheep", "Goat", "Chicken", "Duck", "Rabbit", "Squirrel", "Fox", "Wolf", "Deer", "Hedgehog", "Otter", "Seal", "Walrus", "Penguin", "Flamingo", "Peacock", "Parrot", "Eagle", "Owl", "Bat", "Snake", "Lizard", "Turtle", "Frog", "Crocodile", "Shark", "Dolphin", "Whale", "Octopus", "Jellyfish", "Butterfly", "Bee", "Ant", "Spider"],
  objects_things: ["Book", "Pen", "Pencil", "Notebook", "Phone", "Computer", "Tablet", "TV", "Remote", "Lamp", "Chair", "Table", "Bed", "Pillow", "Blanket", "Cup", "Plate", "Fork", "Spoon", "Knife", "Bottle", "Glass", "Bag", "Backpack", "Wallet", "Keys", "Clock", "Watch", "Mirror", "Brush", "Comb", "Toothbrush", "Soap", "Towel", "Shoes", "Hat", "Glasses", "Umbrella", "Ball", "Toy", "Balloon", "Candle", "Flower", "Plant", "Camera", "Headphones", "Battery", "Charger", "Scissors", "Tape"],
  places: ["School", "Park", "Beach", "Zoo", "Museum", "Library", "Shop", "Supermarket", "Hospital", "Airport", "Train Station", "Cinema", "Restaurant", "Cafe", "Home", "Bedroom", "Kitchen", "Bathroom", "Playground", "Farm", "Forest", "Mountain", "River", "Lake", "Island", "City", "Village", "Country", "Space", "Moon", "Mars", "Planet", "Castle", "Palace", "Temple", "Church", "Mosque", "Stadium", "Gym", "Pool", "Circus", "Amusement Park", "Camping Site", "Desert", "Jungle", "Cave", "Volcano", "Lighthouse"],
  school_education: ["Teacher", "Student", "Classroom", "Desk", "Chair", "Blackboard", "Whiteboard", "Book", "Notebook", "Pencil", "Pen", "Eraser", "Ruler", "Calculator", "Maths", "Science", "English", "History", "Geography", "Art", "Music", "PE", "Homework", "Exam", "Test", "Grade", "Report Card", "Library", "Principal", "Bell", "Recess", "Lunch", "Backpack", "Uniform", "Projector", "Computer Lab", "Science Lab", "Playground", "Assembly", "Field Trip", "Graduation", "Degree", "University", "College", "Lecture", "Tutor", "Essay", "Quiz"],
  technology_gadgets: ["Smartphone", "Laptop", "Tablet", "Smartwatch", "Headphones", "Earphones", "Charger", "USB", "Mouse", "Keyboard", "Monitor", "Printer", "Camera", "Drone", "Robot", "VR Headset", "Game Console", "Joystick", "Speaker", "Microphone", "Router", "Modem", "WiFi", "Bluetooth", "App", "Internet", "Website", "Email", "Social Media", "Battery", "Screen", "Touchscreen", "Camera Lens", "Flashlight", "Calculator App", "E-Reader", "Smart TV", "Streaming Device", "Fitness Tracker", "Virtual Assistant", "Drone Camera", "Portable Charger", "External Hard Drive", "SSD", "GPU", "CPU", "RAM", "Gaming Mouse", "Mechanical Keyboard"],
  nature_outdoors: ["Tree", "Flower", "Grass", "Leaf", "Bush", "Forest", "Mountain", "River", "Lake", "Ocean", "Beach", "Sand", "Rock", "Cave", "Waterfall", "Rainbow", "Sun", "Moon", "Star", "Cloud", "Rain", "Snow", "Wind", "Storm", "Thunder", "Lightning", "Sunset", "Sunrise", "Bird", "Butterfly", "Bee", "Ant", "Spider", "Squirrel", "Deer", "Fox", "Bear", "Hiking", "Camping", "Fishing", "Picnic", "Garden", "Park", "Trail", "Canyon", "Valley", "Meadow", "Field", "Volcano", "Desert", "Jungle"],
  famous_people: ["Elon Musk", "Taylor Swift", "Cristiano Ronaldo", "Lionel Messi", "Beyonce", "Dwayne Johnson", "Ariana Grande", "Bill Gates", "Oprah Winfrey", "Barack Obama", "Michelle Obama", "Albert Einstein", "Leonardo da Vinci", "Cleopatra", "Nelson Mandela", "Martin Luther King", "Mahatma Gandhi", "Marie Curie", "Isaac Newton", "Stephen Hawking", "Greta Thunberg", "Malala Yousafzai", "Serena Williams", "Usain Bolt", "Michael Jordan", "Kobe Bryant", "LeBron James", "Adele", "Ed Sheeran", "Justin Bieber", "Lady Gaga", "Katy Perry", "Harry Styles", "Emma Watson", "Tom Holland", "Zendaya", "Margot Robbie", "Ryan Reynolds", "Chris Hemsworth", "Scarlett Johansson"],
  hobbies: ["Reading", "Drawing", "Painting", "Writing", "Photography", "Gaming", "Coding", "Gardening", "Cooking", "Baking", "Hiking", "Camping", "Fishing", "Swimming", "Running", "Yoga", "Dancing", "Singing", "Playing Guitar", "Playing Piano", "Collecting Stamps", "Collecting Coins", "Knitting", "Sewing", "Origami", "Puzzles", "Board Games", "Card Games", "Chess", "Sudoku", "Bird Watching", "Star Gazing", "Traveling", "Blogging", "Vlogging", "Social Media", "Fitness", "Martial Arts", "Skateboarding", "Cycling", "Surfing", "Skiing", "Snowboarding"],
  sports_games: ["Football", "Soccer", "Basketball", "Tennis", "Cricket", "Rugby", "Golf", "Swimming", "Athletics", "Volleyball", "Badminton", "Table Tennis", "Baseball", "Hockey", "Ice Hockey", "Boxing", "Wrestling", "Martial Arts", "Karate", "Judo", "Taekwondo", "Chess", "Checkers", "Monopoly", "Scrabble", "Uno", "Poker", "Bingo", "Bowling", "Darts", "Archery", "Fencing", "Skiing", "Snowboarding", "Surfing", "Skateboarding", "Cycling", "Running", "Marathon", "Triathlon"],
  vehicles_transportation: ["Car", "Bus", "Train", "Plane", "Helicopter", "Boat", "Ship", "Bicycle", "Motorcycle", "Truck", "Taxi", "Tram", "Subway", "Metro", "Scooter", "Skateboard", "Rollerblades", "Rocket", "Spaceship", "Hot Air Balloon", "Ferry", "Cruise Ship", "Ambulance", "Fire Truck", "Police Car", "Van", "Lorry", "Tractor", "Bulldozer", "Crane", "Excavator", "Formula 1 Car", "Race Car", "Electric Car", "Hybrid Car", "Horse Carriage", "Camel", "Elephant Ride", "Bicycle Rickshaw"],
  holidays_celebrations: ["Christmas", "Halloween", "Easter", "Thanksgiving", "New Year", "Birthday", "Wedding", "Valentine's Day", "Mother's Day", "Father's Day", "Australia Day", "ANZAC Day", "Diwali", "Chinese New Year", "Hanukkah", "Eid", "Ramadan", "Holi", "Passover", "St Patrick's Day", "Independence Day", "Canada Day", "Bastille Day", "Guy Fawkes", "Mardi Gras", "Carnival", "Oktoberfest", "Lunar New Year", "Day of the Dead", "Loy Krathong"],
  music_entertainment: ["Guitar", "Piano", "Drums", "Violin", "Trumpet", "Saxophone", "Flute", "Concert", "Festival", "Album", "Song", "Music Video", "DJ", "Singer", "Band", "Orchestra", "Karaoke", "Dance", "Theatre", "Movie", "TV Show", "Streaming", "Podcast", "Radio", "Headphones", "Speaker", "Microphone", "Stage", "Spotlight", "Curtain", "Pop", "Rock", "Hip Hop", "Jazz", "Classical", "Country", "Electronic"],
  fruits: ["Apple", "Banana", "Orange", "Mango", "Strawberry", "Grape", "Pineapple", "Watermelon", "Kiwi", "Peach", "Pear", "Plum", "Cherry", "Blueberry", "Raspberry", "Blackberry", "Lemon", "Lime", "Passionfruit", "Avocado", "Coconut", "Papaya", "Pomegranate", "Fig", "Apricot", "Nectarine", "Grapefruit", "Mandarin", "Clementine", "Dragonfruit", "Lychee", "Rambutan", "Guava", "Starfruit", "Jackfruit", "Durian", "Persimmon", "Custard Apple", "Mulberry", "Gooseberry", "Boysenberry", "Cranberry", "Elderberry"],
  vegetables: ["Carrot", "Potato", "Onion", "Tomato", "Broccoli", "Cauliflower", "Spinach", "Lettuce", "Cabbage", "Kale", "Zucchini", "Eggplant", "Capsicum", "Cucumber", "Celery", "Asparagus", "Green Beans", "Peas", "Corn", "Pumpkin", "Sweet Potato", "Beetroot", "Radish", "Turnip", "Parsnip", "Mushroom", "Garlic", "Ginger", "Leek", "Spring Onion", "Bok Choy", "Snow Peas", "Fennel", "Kohlrabi", "Daikon", "Watercress", "Arugula", "Swiss Chard", "Okra", "Chilli", "Jalapeño", "Artichoke", "Squash", "Butternut Squash"],
  drinks_beverages: ["Water", "Milk", "Juice", "Orange Juice", "Apple Juice", "Coffee", "Tea", "Green Tea", "Black Tea", "Hot Chocolate", "Soda", "Cola", "Lemonade", "Iced Tea", "Smoothie", "Milkshake", "Beer", "Wine", "Champagne", "Cocktail", "Margarita", "Mojito", "Energy Drink", "Sports Drink", "Kombucha", "Boba Tea", "Matcha Latte", "Flat White", "Latte", "Cappuccino", "Espresso", "Herbal Tea", "Ginger Beer", "Root Beer", "Sparkling Water", "Tonic Water"],
  desserts: ["Ice Cream", "Cake", "Chocolate Cake", "Cheesecake", "Brownie", "Cookie", "Donut", "Cupcake", "Pudding", "Pie", "Apple Pie", "Pavlova", "Lamington", "Tim Tam", "Macaron", "Tiramisu", "Gelato", "Creme Brulee", "Profiterole", "Eclair", "Baklava", "Churros", "Flan", "Tres Leches", "Red Velvet Cake", "Carrot Cake", "Sticky Date Pudding", "Trifle", "Mousse", "Souffle", "Panna Cotta", "Waffles", "Pancakes", "Cinnamon Roll", "Scone"],
  fast_food: ["Pizza", "Burger", "Cheeseburger", "Fries", "Chicken Nuggets", "Hot Dog", "Taco", "Burrito", "Shawarma", "Kebab", "Sushi", "Fish & Chips", "Fried Chicken", "Sandwich", "Sub", "Nachos", "Quesadilla", "Onion Rings", "Milkshake", "Soft Serve", "Apple Pie", "McFlurry", "Donut", "Pancakes", "Waffles", "Chiko Roll", "Dim Sim", "Meat Pie", "Sausage Roll"],
  breakfast_foods: ["Pancakes", "Waffles", "French Toast", "Omelette", "Scrambled Eggs", "Bacon", "Sausage", "Cereal", "Oatmeal", "Toast", "Jam", "Peanut Butter", "Avocado Toast", "Yoghurt", "Fruit Salad", "Muffin", "Croissant", "Bagel", "Hash Browns", "Beans on Toast", "Porridge", "Granola", "Smoothie Bowl", "Eggs Benedict", "Breakfast Burrito", "Poha", "Idli", "Dosa", "Paratha"],
  spices_and_herbs: ["Salt", "Pepper", "Cinnamon", "Paprika", "Cumin", "Turmeric", "Chilli Powder", "Ginger", "Garlic", "Oregano", "Basil", "Thyme", "Rosemary", "Sage", "Parsley", "Coriander", "Mint", "Dill", "Bay Leaf", "Nutmeg", "Cloves", "Cardamom", "Curry Powder", "Garam Masala", "Cayenne", "Smoked Paprika", "Sesame Seeds", "Mustard Seeds", "Fennel Seeds", "Za'atar"],
  snacks: ["Chips", "Popcorn", "Pretzels", "Crackers", "Nuts", "Trail Mix", "Granola Bar", "Chocolate Bar", "Gummy Bears", "Jerky", "Rice Crackers", "Cheese Puffs", "Cookies", "Biscuits", "Fruit Snacks", "Dried Fruit", "Yoghurt", "Cheese Stick", "Veggie Straws", "Hummus", "Guacamole", "Salsa", "Pita Chips"],
  birds: ["Eagle", "Owl", "Parrot", "Flamingo", "Peacock", "Swan", "Hummingbird", "Penguin", "Toucan", "Kiwi", "Kookaburra", "Cockatoo", "Magpie", "Galah", "Lorikeet", "Budgerigar", "Robin", "Sparrow", "Pigeon", "Dove", "Falcon", "Hawk", "Vulture", "Albatross", "Pelican", "Seagull", "Raven", "Crow", "Cassowary", "Emu"],
  insects_bugs: ["Butterfly", "Bee", "Ant", "Spider", "Ladybug", "Beetle", "Mosquito", "Fly", "Dragonfly", "Grasshopper", "Cricket", "Moth", "Wasp", "Hornet", "Cockroach", "Termite", "Firefly", "Caterpillar", "Centipede", "Millipede", "Scorpion", "Praying Mantis", "Locust", "Cicada", "Stick Insect", "Leaf Insect"],
  fish_sea_creatures: ["Shark", "Dolphin", "Whale", "Octopus", "Jellyfish", "Seahorse", "Sea Turtle", "Starfish", "Clownfish", "Manta Ray", "Stingray", "Crab", "Lobster", "Prawn", "Squid", "Cuttlefish", "Nautilus", "Eel", "Barracuda", "Tuna", "Salmon", "Cod", "Pufferfish", "Lionfish", "Angelfish", "Parrotfish"],
  // Add any remaining categories you want from your original list
  // (this is a subset to keep the file readable; you can paste the rest)
};

// In-memory storage for active rooms
const rooms = {};   // code → { secret, players: [{id, name, seen}], status, host, imposter }

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('createRoom', ({ name, category }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const wordList = categories[category] || categories.food; // fallback
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
    if (room.players.some(p => p.name === name)) return socket.emit('error', 'Name already taken');

    room.players.push({ id: socket.id, name, seen: false });
    socket.join(code);
    io.to(code).emit('playersUpdate', room.players);
  });

  socket.on('markSeen', (code) => {
    code = code.toUpperCase();
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) player.seen = true;

    io.to(code).emit('playersUpdate', room.players);

    // Auto-start game when everyone has seen (≥3 players)
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
    if (!room || socket.id !== room.host) return socket.emit('error', 'Only host can reveal');

    io.to(code).emit('gameRevealed', {
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
  console.log(`Server listening on port ${PORT}`);
});
