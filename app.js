require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const app = express();

// MongoDB connection
mongoose.connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Session & flash config
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const itemRoutes = require('./routes/items');

app.use(userRoutes);
app.use(chatRoutes);
app.use('/', itemRoutes);

// Server & Socket.io setup
const server = app.listen(3000, () => console.log("Server running at 3000"));
const io = require('socket.io')(server);

// Socket.io events
io.on('connection', socket => {
  console.log('✅ New socket connection');

  socket.on('join-room', roomId => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  socket.on('typing', ({ receiver }) => {
    io.to(receiver).emit('typing');
  });

  socket.on('send-message', ({ sender, receiver, text }) => {
    io.to(receiver).emit('receive-message', { sender, text });
  });
});
