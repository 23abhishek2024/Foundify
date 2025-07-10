const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');

// Chat page between two users
router.get('/chat/:receiverId', async (req, res) => {
  try {
    if (!req.session.userId) {
      req.flash('error', 'Please login to access chat.');
      return res.redirect('/login');
    }

    const messages = await Message.find({
      $or: [
        { sender: req.session.userId, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.session.userId }
      ]
    }).populate('sender'); // ✅ Only populate sender to avoid _id undefined error

    const receiver = await User.findById(req.params.receiverId);
    if (!receiver) {
      req.flash('error', 'User not found.');
      return res.redirect('/');
    }

    res.render('chat', { messages, receiver });

  } catch (err) {
    console.error('Chat Error:', err);
    req.flash('error', 'Failed to load chat.');
    res.redirect('/');
  }
});

// Send message
router.post('/chat/:receiverId', async (req, res) => {
  try {
    if (!req.session.userId) {
      req.flash('error', 'Please login to send messages.');
      return res.redirect('/login');
    }

    await Message.create({
      sender: req.session.userId,
      receiver: req.params.receiverId,
      text: req.body.text
    });

    res.redirect('/chat/' + req.params.receiverId);
  } catch (err) {
    console.error('Send Message Error:', err);
    req.flash('error', 'Failed to send message.');
    res.redirect('/');
  }
});

module.exports = router;

// GET /inbox
router.get('/inbox', async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const userId = req.session.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .sort({ createdAt: -1 }) // recent message first
      .populate('sender receiver');

    // Unique conversation list
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId
        ? msg.receiver
        : msg.sender;

      if (!conversationsMap.has(otherUser._id.toString())) {
        conversationsMap.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: msg
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.render('inbox', { conversations });

  } catch (err) {
    console.error('Inbox Error:', err);
    res.redirect('/');
  }
});
