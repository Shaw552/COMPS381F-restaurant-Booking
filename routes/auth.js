const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/reservations');
  }
  res.render('login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    res.render('login', { error: 'Login failed, please try again later' });
  }
});

// Register page
router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/reservations');
  }
  res.render('register', { error: null });
});

// Register handler
router.post('/register', async (req, res) => {
  try {
    const { name, contact, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'This email is already registered' });
    }
    
    const user = new User({ name, contact, email, password });
    await user.save();
    
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    res.render('register', { error: 'Registration failed, please try again later' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

module.exports = router;

