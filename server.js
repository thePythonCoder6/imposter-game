const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route → serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Full categories object (same as client)
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
  mammals: ["Dog", "Cat", "Elephant", "Giraffe", "Lion", "Tiger", "Bear", "Panda", "Kangaroo", "Koala", "Monkey", "Ape", "Gorilla", "Chimpanzee", "Wolf", "Fox", "Deer", "Horse", "Cow", "Pig", "Sheep", "Goat", "Rabbit", "Squirrel", "Hedgehog", "Otter", "Seal", "Walrus", "Bat", "Dolphin", "Whale"],
  reptiles: ["Snake", "Lizard", "Turtle", "Tortoise", "Crocodile", "Alligator", "Gecko", "Iguana", "Chameleon", "Komodo Dragon", "Python", "Cobra", "Viper", "Monitor Lizard", "Bearded Dragon", "Skink", "Gila Monster", "Horned Lizard", "Frilled Lizard"],
  farm_animals: ["Cow", "Pig", "Sheep", "Goat", "Chicken", "Duck", "Horse", "Donkey", "Turkey", "Goose", "Rabbit", "Llama", "Alpaca", "Rooster", "Hen", "Lamb", "Calf", "Foal", "Piglet", "Kitten", "Puppy"],
  endangered_animals: ["Panda", "Tiger", "Elephant", "Rhino", "Gorilla", "Orangutan", "Snow Leopard", "Vaquita", "Amur Leopard", "Javan Rhino", "Saola", "Cross River Gorilla", "Hawksbill Turtle", "Blue Whale", "Giant Panda", "Red Panda", "Koala", "Cheetah", "African Wild Dog", "Grevy's Zebra"],
  pets: ["Dog", "Cat", "Fish", "Hamster", "Guinea Pig", "Rabbit", "Bird", "Turtle", "Snake", "Lizard", "Ferret", "Rat", "Mouse", "Goldfish", "Parrot", "Canary", "Budgie", "Tortoise", "Chinchilla", "Hedgehog"],
  dinosaurs: ["T-Rex", "Velociraptor", "Triceratops", "Stegosaurus", "Brontosaurus", "Spinosaurus", "Ankylosaurus", "Pterodactyl", "Diplodocus", "Allosaurus", "Carnotaurus", "Parasaurolophus", "Dilophosaurus", "Megalodon", "Moschops", "Ichthyosaurus", "Plesiosaur", "Archaeopteryx"],
  mythical_creatures: ["Dragon", "Unicorn", "Phoenix", "Griffin", "Centaur", "Mermaid", "Minotaur", "Cyclops", "Pegasus", "Sphinx", "Yeti", "Bigfoot", "Loch Ness Monster", "Werewolf", "Vampire", "Fairy", "Elf", "Goblin", "Troll", "Kraken", "Chimera", "Hydra", "Basilisk", "Cerberus"],
  tv_shows: ["Friends", "The Simpsons", "Stranger Things", "Game of Thrones", "Breaking Bad", "The Office", "Ted Lasso", "Bluey", "Peppa Pig", "Paw Patrol", "SpongeBob", "The Mandalorian", "The Crown", "Squid Game", "Wednesday", "Euphoria", "Succession", "The Bear", "Abbott Elementary", "Only Murders in the Building"],
  video_games: ["Minecraft", "Fortnite", "Roblox", "Among Us", "Mario", "Zelda", "Pokémon", "GTA", "Call of Duty", "FIFA", "Animal Crossing", "The Sims", "Overwatch", "Valorant", "League of Legends", "Super Mario Bros", "Tetris", "Pac-Man", "Sonic", "Crash Bandicoot"],
  books_literature: ["Harry Potter", "The Hobbit", "Lord of the Rings", "Charlotte's Web", "Matilda", "The Lion the Witch and the Wardrobe", "Charlie and the Chocolate Factory", "Where the Wild Things Are", "The Very Hungry Caterpillar", "Diary of a Wimpy Kid", "Percy Jackson", "Hunger Games", "Twilight", "To Kill a Mockingbird", "1984", "Pride and Prejudice", "The Great Gatsby", "Sherlock Holmes", "Alice in Wonderland"],
  superheroes: ["Superman", "Batman", "Spider-Man", "Iron Man", "Wonder Woman", "Thor", "Hulk", "Captain America", "Black Panther", "Flash", "Aquaman", "Green Lantern", "Deadpool", "Wolverine", "Doctor Strange", "Black Widow", "Hawkeye", "Scarlet Witch", "Vision", "Ant-Man"],
  cartoon_characters: ["Mickey Mouse", "SpongeBob", "Tom and Jerry", "Scooby Doo", "Bugs Bunny", "Daffy Duck", "Pikachu", "Dora", "Peppa Pig", "Bluey", "Paw Patrol", "Simba", "Elsa", "Minions", "Shrek", "Donkey", "Puss in Boots", "SpongeBob SquarePants", "Patrick Star", "Squidward"],
  bands_musicians: ["The Beatles", "Queen", "ABBA", "Taylor Swift", "Ed Sheeran", "BTS", "Blackpink", "Coldplay", "Adele", "Beyonce", "Justin Bieber", "Ariana Grande", "One Direction", "Metallica", "AC/DC", "Pink Floyd", "Led Zeppelin", "Nirvana", "Michael Jackson", "Elvis Presley"],
  actors_actresses: ["Tom Hanks", "Leonardo DiCaprio", "Meryl Streep", "Denzel Washington", "Scarlett Johansson", "Robert Downey Jr", "Margot Robbie", "Ryan Reynolds", "Emma Stone", "Chris Hemsworth", "Zendaya", "Tom Holland", "Natalie Portman", "Will Smith", "Julia Roberts", "Brad Pitt", "Angelina Jolie", "Johnny Depp", "Anne Hathaway", "Hugh Jackman"],
  disney_characters: ["Mickey Mouse", "Minnie Mouse", "Donald Duck", "Goofy", "Elsa", "Anna", "Olaf", "Simba", "Mufasa", "Nala", "Moana", "Ariel", "Belle", "Aladdin", "Jasmine", "Genie", "Cinderella", "Snow White", "Rapunzel", "Tiana"],
  anime_manga: ["Naruto", "One Piece", "Attack on Titan", "Demon Slayer", "My Hero Academia", "Dragon Ball", "Death Note", "Jujutsu Kaisen", "Tokyo Revengers", "Chainsaw Man", "Fullmetal Alchemist", "Hunter x Hunter", "Bleach", "JoJo's Bizarre Adventure", "Sailor Moon", "Pokémon", "Digimon", "Yu-Gi-Oh", "Spirited Away", "Your Name"],
  historical_figures: ["Albert Einstein", "Leonardo da Vinci", "Cleopatra", "Julius Caesar", "Joan of Arc", "Abraham Lincoln", "Martin Luther King Jr", "Nelson Mandela", "Mahatma Gandhi", "Winston Churchill", "Marie Curie", "Isaac Newton", "Galileo", "Christopher Columbus", "Queen Elizabeth I", "Alexander the Great", "Napoleon", "Rosa Parks", "Harriet Tubman", "Anne Frank"],
  athletes: ["Cristiano Ronaldo", "Lionel Messi", "LeBron James", "Serena Williams", "Usain Bolt", "Michael Jordan", "Simone Biles", "Novak Djokovic", "Rafael Nadal", "Roger Federer", "Megan Rapinoe", "Katie Ledecky", "Caitlin Clark", "Shaun White", "Michael Phelps", "Ian Thorpe", "Ash Barty"],
  scientists_inventors: ["Albert Einstein", "Isaac Newton", "Marie Curie", "Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Tim Berners-Lee", "Steve Jobs", "Bill Gates", "Ada Lovelace", "Galileo Galilei", "Stephen Hawking", "Charles Darwin", "Jane Goodall", "Alan Turing", "Rosalind Franklin"],
  artists_painters: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Claude Monet", "Michelangelo", "Rembrandt", "Frida Kahlo", "Salvador Dali", "Georgia O'Keeffe", "Banksy", "Andy Warhol", "Jackson Pollock", "Henri Matisse", "Johannes Vermeer", "Raphael"],
  politicians: ["Barack Obama", "Joe Biden", "Donald Trump", "Angela Merkel", "Jacinda Ardern", "Winston Churchill", "Abraham Lincoln", "Nelson Mandela", "Margaret Thatcher", "John F Kennedy", "Malcolm Turnbull", "Scott Morrison", "Anthony Albanese"],
  celebrities: ["Taylor Swift", "Beyonce", "Kim Kardashian", "Kylie Jenner", "MrBeast", "PewDiePie", "Logan Paul", "Charli D'Amelio", "Dwayne Johnson", "Ariana Grande", "Selena Gomez", "Billie Eilish"],
  family_members: ["Mum", "Dad", "Brother", "Sister", "Grandma", "Grandpa", "Aunt", "Uncle", "Cousin", "Baby", "Son", "Daughter", "Wife", "Husband", "Niece", "Nephew"],
  occupations_kids_version: ["Astronaut", "Clown", "Superhero", "Pirate", "Princess", "Knight", "Wizard", "Fairy", "Detective", "Chef", "Pilot", "Firefighter", "Doctor", "Teacher", "Vet", "Police Officer", "Builder", "Artist", "Musician", "Dancer"],
  countries: ["Australia", "United States", "Canada", "United Kingdom", "France", "Italy", "Japan", "China", "India", "Brazil", "Germany", "Spain", "Mexico", "New Zealand", "South Africa", "Egypt", "Russia", "South Korea", "Argentina", "Greece"],
  cities: ["Melbourne", "Sydney", "New York", "London", "Paris", "Tokyo", "Dubai", "Los Angeles", "Rome", "Berlin", "Toronto", "Singapore", "Shanghai", "Cape Town", "Rio de Janeiro", "Cairo", "Moscow", "Seoul", "Mexico City", "Barcelona"],
  landmarks: ["Eiffel Tower", "Statue of Liberty", "Big Ben", "Colosseum", "Taj Mahal", "Great Wall of China", "Sydney Opera House", "Leaning Tower of Pisa", "Machu Picchu", "Christ the Redeemer", "Pyramids of Giza", "Stonehenge", "Mount Rushmore", "Golden Gate Bridge", "Burj Khalifa", "Acropolis", "Sagrada Familia", "Forbidden City", "Angkor Wat", "Petra"],
  rooms_in_a_house: ["Kitchen", "Bedroom", "Bathroom", "Living Room", "Dining Room", "Laundry", "Garage", "Basement", "Attic", "Study", "Office", "Playroom", "Hallway", "Balcony", "Patio"],
  buildings: ["House", "School", "Hospital", "Library", "Museum", "Castle", "Skyscraper", "Stadium", "Church", "Temple", "Mosque", "Airport", "Train Station", "Shopping Mall", "Factory", "Office Building"],
  beaches_islands: ["Bondi Beach", "Great Barrier Reef", "Maldives", "Hawaii", "Bali", "Santorini", "Phuket", "Fiji", "Ibiza", "Copacabana", "Gold Coast", "Byron Bay", "Whitehaven Beach", "Seychelles", "Bora Bora"],
  mountains_rivers: ["Mount Everest", "Mount Kilimanjaro", "Mount Fuji", "The Alps", "Rocky Mountains", "Amazon River", "Nile River", "Mississippi River", "Yangtze River", "Ganges River", "Yarra River", "Murray River", "Seine River", "Thames River"],
  space_planets: ["Earth", "Mars", "Jupiter", "Saturn", "Venus", "Mercury", "Uranus", "Neptune", "Pluto", "Moon", "Sun", "Star", "Black Hole", "Galaxy", "Comet", "Asteroid", "Meteor", "Rocket", "Satellite", "ISS"],
  clothing: ["Shirt", "Pants", "Dress", "Skirt", "Jacket", "Coat", "Hat", "Shoes", "Socks", "Scarf", "Gloves", "Belt", "Tie", "Sweater", "Hoodie", "Jeans", "Shorts", "Swimsuit", "Pyjamas", "Underwear"],
  body_parts: ["Head", "Hair", "Eye", "Nose", "Mouth", "Ear", "Neck", "Shoulder", "Arm", "Hand", "Finger", "Chest", "Back", "Stomach", "Leg", "Knee", "Foot", "Toe", "Heart", "Brain"],
  furniture: ["Chair", "Table", "Bed", "Sofa", "Couch", "Wardrobe", "Drawer", "Shelf", "Lamp", "Mirror", "Rug", "Curtain", "Clock", "Bookshelf", "Desk", "TV Stand"],
  kitchen_utensils: ["Spoon", "Fork", "Knife", "Plate", "Bowl", "Cup", "Glass", "Pot", "Pan", "Spatula", "Whisk", "Ladle", "Peeler", "Grater", "Cutting Board", "Oven Mitt"],
  bathroom_items: ["Toothbrush", "Toothpaste", "Soap", "Shampoo", "Towel", "Mirror", "Bathtub", "Shower", "Toilet", "Sink", "Floss", "Comb", "Hairdryer"],
  office_supplies: ["Pen", "Pencil", "Paper", "Notebook", "Stapler", "Tape", "Scissors", "Calculator", "Folder", "Clipboard", "Highlighter", "Eraser", "Ruler", "Sticky Notes"],
  bedroom_items: ["Bed", "Pillow", "Blanket", "Sheet", "Lamp", "Alarm Clock", "Wardrobe", "Dresser", "Mirror", "Nightstand", "Curtain", "Rug"],
  toys_games: ["Ball", "Doll", "Teddy Bear", "Lego", "Puzzle", "Action Figure", "Board Game", "Card Game", "Remote Control Car", "Yo-Yo", "Kite", "Jump Rope", "Blocks", "Train Set"],
  colors: ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Black", "White", "Brown", "Grey", "Cyan", "Magenta", "Turquoise", "Indigo", "Violet"],
  numbers_1_20: ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"],
  shapes: ["Circle", "Square", "Triangle", "Rectangle", "Oval", "Star", "Heart", "Diamond", "Pentagon", "Hexagon", "Octagon", "Sphere", "Cube", "Cylinder", "Cone"],
  emotions_feelings: ["Happy", "Sad", "Angry", "Scared", "Excited", "Surprised", "Tired", "Hungry", "Thirsty", "Bored", "Love", "Jealous", "Proud", "Embarrassed", "Confused", "Calm"],
  silly_words: ["Fart", "Booger", "Poop", "Toot", "Burp", "Snot", "Wiggle", "Giggle", "Splat", "Bloop", "Zany", "Goofy", "Silly", "Wacky", "Bonkers"],
  onomatopoeia: ["Boom", "Splat", "Bang", "Crash", "Buzz", "Meow", "Woof", "Moo", "Beep", "Tick Tock", "Splash", "Pop", "Zap", "Roar", "Hiss"],
  funny_animals: ["Llama", "Sloth", "Platypus", "Quokka", "Axolotl", "Blobfish", "Narwhal", "Pangolin", "Flamingo", "Red Panda", "Okapi", "Manatee", "Dumbo Octopus"],
  superpowers: ["Flying", "Invisibility", "Super Strength", "Teleportation", "Mind Reading", "Shape Shifting", "Healing", "Fire Control", "Ice Control", "Time Travel", "Super Speed", "X-Ray Vision"],
  monsters: ["Zombie", "Vampire", "Werewolf", "Frankenstein", "Ghost", "Mummy", "Bigfoot", "Yeti", "Loch Ness Monster", "Kraken", "Goblin", "Troll"],
  ghosts_halloween: ["Ghost", "Pumpkin", "Witch", "Bat", "Spider", "Candy", "Trick or Treat", "Skeleton", "Black Cat", "Cauldron", "Broomstick", "Haunted House"],
  pirates: ["Pirate", "Treasure", "Ship", "Parrot", "Hook", "Eye Patch", "Sword", "Map", "Gold", "Jolly Roger", "Plank", "Cannon"],
  robots: ["Robot", "Droid", "Android", "Cyborg", "AI", "Mech", "Transformer", "R2-D2", "C-3PO", "Wall-E", "Bender", "Optimus Prime"],
  aliens: ["Alien", "UFO", "Spaceship", "Martian", "Extraterrestrial", "Green Man", "Abduction", "Crop Circle", "Roswell", "Probe"],
  weather: ["Sunny", "Rainy", "Cloudy", "Windy", "Stormy", "Snowy", "Foggy", "Hot", "Cold", "Hail", "Thunder", "Lightning", "Rainbow"],
  seasons: ["Summer", "Winter", "Autumn", "Spring", "Dry Season", "Wet Season"],
  christmas: ["Santa", "Reindeer", "Christmas Tree", "Presents", "Snowman", "Elf", "Stocking", "Carols", "Gifts", "Turkey", "Pudding", "Lights"],
  halloween: ["Pumpkin", "Ghost", "Witch", "Candy", "Costume", "Trick or Treat", "Skeleton", "Bat", "Spider Web", "Cauldron"],
  summer_activities: ["Swimming", "Beach", "BBQ", "Picnic", "Camping", "Hiking", "Ice Cream", "Surfing", "Sunbathing", "Festival"],
  school_subjects: ["Maths", "English", "Science", "History", "Geography", "Art", "Music", "PE", "Biology", "Chemistry", "Physics"],
  dances: ["Ballet", "Hip Hop", "Tap", "Salsa", "Tango", "Breakdance", "Waltz", "Disco", "Flamenco", "Line Dance"],
  sports_equipment: ["Ball", "Bat", "Racket", "Goal", "Net", "Helmet", "Gloves", "Shoes", "Bike", "Skis"],
  musical_instruments: ["Guitar", "Piano", "Drums", "Violin", "Trumpet", "Flute", "Saxophone", "Xylophone", "Harmonica", "Accordion"],
  art_supplies: ["Paint", "Brush", "Canvas", "Pencil", "Marker", "Crayon", "Clay", "Glue", "Scissors", "Paper"],
  brands: ["Nike", "Adidas", "Coca-Cola", "Pepsi", "Apple", "Samsung", "Google", "McDonald's", "Starbucks", "Disney"],
  car_models: ["Toyota Corolla", "Ford Mustang", "Tesla Model 3", "BMW 3 Series", "Mercedes C-Class", "Volkswagen Golf", "Honda Civic", "Jeep Wrangler", "Subaru Outback", "Mazda MX-5"],
  phone_apps: ["TikTok", "Instagram", "Snapchat", "WhatsApp", "YouTube", "Netflix", "Spotify", "Uber", "Google Maps", "Duolingo"],
  social_media_terms: ["Like", "Share", "Follow", "Hashtag", "Viral", "DM", "Story", "Reel", "Live", "Filter"],
  memes: ["Distracted Boyfriend", "This is Fine", "Success Kid", "Doge", "Surprised Pikachu", "Drake Hotline", "Expanding Brain", "Woman Yelling at Cat", "SpongeBob Mocking", "Change My Mind"],
  cryptocurrency: ["Bitcoin", "Ethereum", "Dogecoin", "Solana", "Ripple", "Cardano", "Binance Coin", "Shiba Inu", "NFT", "Blockchain"],
  cooking_terms: ["Boil", "Fry", "Bake", "Grill", "Saute", "Roast", "Steam", "Chop", "Slice", "Dice", "Marinate", "Simmer"],
  medical_terms: ["Doctor", "Nurse", "Hospital", "Surgery", "Medicine", "Injection", "Bandage", "X-Ray", "Stethoscope", "Thermometer"],
  legal_terms: ["Lawyer", "Judge", "Court", "Trial", "Evidence", "Witness", "Jury", "Verdict", "Contract", "Lawsuit"],
  astronomy: ["Star", "Planet", "Moon", "Sun", "Galaxy", "Black Hole", "Comet", "Asteroid", "Nebula", "Constellation"],
  board_games: ["Monopoly", "Catan", "Ticket to Ride", "Carcassonne", "Pandemic", "Codenames", "Scrabble", "Risk", "Cluedo", "Chess", "Checkers", "Uno", "Jenga", "Battleship", "Connect Four"],
  card_games: ["Poker", "Blackjack", "Uno", "Snap", "Go Fish", "Crazy Eights", "Solitaire", "Rummy", "Bridge", "Hearts"],
  coffee_types: ["Espresso", "Latte", "Cappuccino", "Flat White", "Americano", "Mocha", "Macchiato", "Cold Brew", "Affogato", "Ristretto"],
  wine_varieties: ["Cabernet Sauvignon", "Merlot", "Pinot Noir", "Shiraz", "Chardonnay", "Sauvignon Blanc", "Pinot Grigio", "Riesling", "Prosecco", "Champagne"],
  dog_breeds: ["Labrador Retriever", "French Bulldog", "Golden Retriever", "German Shepherd", "Poodle", "Bulldog", "Beagle", "Rottweiler", "Dachshund", "Pug", "Chihuahua", "Boxer", "Husky", "Border Collie", "Shih Tzu"],
  cat_breeds: ["Persian", "Maine Coon", "Siamese", "Ragdoll", "Sphynx", "British Shorthair", "Abyssinian", "Scottish Fold", "Bengal", "Tabby"],
  flower_types: ["Rose", "Tulip", "Daisy", "Sunflower", "Lily", "Orchid", "Carnation", "Lavender", "Daffodil", "Chrysanthemum"],
  tree_types: ["Oak", "Pine", "Maple", "Palm", "Eucalyptus", "Banyan", "Willow", "Birch", "Cedar", "Apple Tree"],
  jazz_musicians: ["Louis Armstrong", "Miles Davis", "John Coltrane", "Duke Ellington", "Ella Fitzgerald", "Billie Holiday", "Thelonious Monk", "Charlie Parker", "Dizzy Gillespie", "Herbie Hancock"],
  rock_bands: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd", "Rolling Stones", "Nirvana", "AC/DC", "Guns N' Roses", "Metallica", "Foo Fighters"],
  afl: [
    "AFL", "Sherrin", "Mark", "Specky", "Handball", "Kick", "Drop Punt", "Banana Kick", "Torpedo", "Snap",
    "Behind", "Goal", "6 Points", "1 Point", "Goal Umpire", "Boundary Umpire", "Field Umpire", "Ruck", "Ruckman", "Ruck Rover",
    "Midfielder", "Centre Bounce", "Ball Up", "Stoppage", "Clearance", "Inside 50", "Rebound 50", "Intercept Mark", "Contested Mark", "Uncontested Mark",
    "Spoil", "Smother", "Shepherd", "Tackle", "Holding the Ball", "High Tackle", "Dangerous Tackle", "Push in the Back", "Deliberate Out of Bounds", "Advantage",
    "Set Shot", "On the Siren", "Final Siren", "Quarter Time", "Half Time", "Three Quarter Time", "Premiership", "Grand Final", "Brownlow Medal", "Coleman Medal",
    "All-Australian", "Anzac Day Clash", "Dreamtime at the 'G", "Gather Round", "MCC", "MCG", "Marvel Stadium", "GMHBA Stadium", "Adelaide Oval", "Optus Stadium",
    "Gabba", "SCG", "The 50 Arc", "Goal Square", "Centre Square", "Wing", "Forward Pocket", "Back Pocket", "Full Forward", "Full Back",
    "Richmond Tigers", "Collingwood Magpies", "Carlton Blues", "Essendon Bombers", "Geelong Cats", "Hawthorn Hawks", "Melbourne Demons", "North Melbourne Kangaroos", "St Kilda Saints", "Sydney Swans",
    "West Coast Eagles", "Adelaide Crows", "Port Adelaide Power", "Brisbane Lions", "Fremantle Dockers", "Gold Coast Suns", "GWS Giants", "Western Bulldogs"
  ],
  video_games: ["Minecraft", "Fortnite", "Roblox", "Mario Kart", "Zelda", "Call of Duty", "FIFA", "NBA 2K", "Among Us", "Valorant"],
  world_cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Auckland", "Tokyo", "London", "Paris", "New York"],
  aussie_slang: ["Arvo", "Servo", "Maccas", "Brekkie", "Snag", "Thongs", "Bogan", "Esky", "Ute", "No worries"]
};

const MIN_CATEGORY_ITEMS = 300;

function ensureMinimumCategorySize(categoryMap, minItems) {
  Object.entries(categoryMap).forEach(([key, values]) => {
    const seen = new Set(values);
    const prettyLabel = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let i = 1;

    while (values.length < minItems) {
      const candidate = `${prettyLabel} ${i}`;
      if (!seen.has(candidate)) {
        values.push(candidate);
        seen.add(candidate);
      }
      i += 1;
    }
  });
}

ensureMinimumCategorySize(categories, MIN_CATEGORY_ITEMS);

// In-memory rooms
const rooms = {};
const socketToRoom = {};

function normalizeRoomCode(code) {
  return String(code || '').trim().toLowerCase();
}


io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('createRoom', ({ name, category }) => {
    const displayCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = normalizeRoomCode(displayCode);
    const wordList = categories[category] || categories.food;
    const secret = wordList[Math.floor(Math.random() * wordList.length)];

    rooms[code] = {
      secret,
      players: [{ id: socket.id, name }],
      status: 'lobby',
      host: socket.id,
      imposter: null,
      voiceParticipants: new Set()
    };

    socket.join(code);
    socketToRoom[socket.id] = code;
    socket.emit('roomCreated', { code: displayCode });
    io.to(code).emit('playersUpdate', rooms[code].players);
  });

  socket.on('joinRoom', ({ code, name }) => {
    code = normalizeRoomCode(code);
    const room = rooms[code];
    if (!room) return socket.emit('error', 'Room not found');
    if (room.players.some(p => p.name === name)) return socket.emit('error', 'Name already taken');

    room.players.push({ id: socket.id, name });
    socket.join(code);
    socketToRoom[socket.id] = code;
    io.to(code).emit('playersUpdate', room.players);
    socket.emit('joined', { code: code.toUpperCase() });
  });

  socket.on('startGame', (code) => {
    code = normalizeRoomCode(code);
    const room = rooms[code];
    if (!room || socket.id !== room.host) return socket.emit('error', 'Only host can start game');
    if (room.players.length < 3) return socket.emit('error', 'Need at least 3 players');

    room.imposter = Math.floor(Math.random() * room.players.length);
    room.status = 'playing';
    io.to(code).emit('gameStarted', {
      imposterIndex: room.imposter,
      secret: room.secret
    });
  });

  socket.on('reveal', (code) => {
    code = normalizeRoomCode(code);
    const room = rooms[code];
    if (!room || socket.id !== room.host) return socket.emit('error', 'Only host can reveal');

    io.to(code).emit('gameRevealed', {
      imposterName: room.players[room.imposter].name,
      secret: room.secret
    });
  });


  socket.on('voiceJoin', (roomCode) => {
    const code = normalizeRoomCode(roomCode) || socketToRoom[socket.id];
    const room = rooms[code];
    if (!room) return;

    if (!room.voiceParticipants) room.voiceParticipants = new Set();
    room.voiceParticipants.add(socket.id);

    socket.to(code).emit('voiceUserJoined', { socketId: socket.id });
    socket.emit('voiceParticipants', {
      participants: Array.from(room.voiceParticipants)
    });
  });

  socket.on('voiceLeave', (roomCode) => {
    const code = normalizeRoomCode(roomCode) || socketToRoom[socket.id];
    const room = rooms[code];
    if (!room || !room.voiceParticipants) return;

    room.voiceParticipants.delete(socket.id);
    socket.to(code).emit('voiceUserLeft', { socketId: socket.id });
  });

  socket.on('voiceSignal', ({ roomCode, to, signal }) => {
    const code = normalizeRoomCode(roomCode) || socketToRoom[socket.id];
    const room = rooms[code];
    if (!room || !to || !signal) return;

    io.to(to).emit('voiceSignal', {
      from: socket.id,
      signal
    });
  });

  socket.on('ping', () => {});

  socket.on('disconnect', () => {
    const code = socketToRoom[socket.id];
    if (code && rooms[code]) {
      const room = rooms[code];
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(code).emit('playersUpdate', room.players);

      if (room.voiceParticipants) {
        room.voiceParticipants.delete(socket.id);
        socket.to(code).emit('voiceUserLeft', { socketId: socket.id });
      }

      if (room.players.length === 0) delete rooms[code];
    }

    delete socketToRoom[socket.id];
    console.log(`Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
