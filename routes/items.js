const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/user');
const LostItem = require('../models/lostItem');
const FoundItem = require('../models/foundItem');

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Home page
router.get('/', async (req, res) => {
  const items = await LostItem.find({}).sort({ createdAt: -1 }).limit(6);
  res.render('index', { items });
});

// Search Items
router.get('/search', async (req, res) => {
  const query = req.query.q || "";
  const regex = new RegExp(query, 'i'); // case-insensitive

  const items = await LostItem.find({
    $or: [
      { itemName: regex },
      { description: regex },
      { location: regex }
    ]
  });

  res.render('index', { items });
});


// Register page
router.get('/register', (req, res) => res.render('register'));

// Register logic
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const newUser = new User({ username, email, password: hash });
  await newUser.save();
  req.flash('success', 'Registered successfully!');
  res.redirect('/login');
});

// Login page
router.get('/login', (req, res) => res.render('login'));

// Login logic
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findOne({ email });
  if (!foundUser) {
    req.flash('error', 'Invalid Email or Password');
    return res.redirect('/login');
  }
  const valid = await bcrypt.compare(password, foundUser.password);
  if (valid) {
    req.session.userId = foundUser._id;
    req.flash('success', 'Logged In!');
    res.redirect('/');
  } else {
    req.flash('error', 'Invalid Email or Password');
    res.redirect('/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Report Lost Item page
router.get('/report-lost', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('reportLost');
});

// Report Lost Item logic
router.post('/report-lost', upload.single('photo'), async (req, res) => {
  const { itemName, description, dateLost, location, contactInfo } = req.body;
  const photoUrl = req.file ? '/uploads/' + req.file.filename : null;
  const newItem = new LostItem({
    user: req.session.userId,
    itemName, description, dateLost, location, contactInfo, photoUrl
  });
  await newItem.save();
  req.flash('success', 'Lost Item Reported!');
  res.redirect('/profile');
});

// Report Found Item page
router.get('/report-found', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('reportFound');
});

// Report Found Item logic
router.post('/report-found', upload.single('photo'), async (req, res) => {
  const { itemName, description, dateFound, location, contactInfo } = req.body;
  const photoUrl = req.file ? '/uploads/' + req.file.filename : null;
  const newItem = new FoundItem({
    user: req.session.userId,
    itemName, description, dateFound, location, contactInfo, photoUrl
  });
  await newItem.save();
  req.flash('success', 'Found Item Reported!');
  res.redirect('/profile');
});

// Profile page
router.get('/profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const user = await User.findById(req.session.userId);
  const lostItems = await LostItem.find({ user: user._id });
  const foundItems = await FoundItem.find({ user: user._id });
  res.render('profile', { user, lostItems, foundItems });
});

module.exports = router;
const Comment = require('../models/comment');

// Post a comment
router.post('/comment/:type/:id', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { text } = req.body;
  const { type, id } = req.params;

  await Comment.create({
    user: req.session.userId,
    text,
    forType: type,
    itemId: id
  });

  res.redirect('/user/' + req.body.ownerId);
});
