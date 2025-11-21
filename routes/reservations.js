const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Redirect /reservations to home page
router.get('/', requireAuth, (req, res) => {
  res.redirect('/');
});

// Reservation list page
router.get('/list', requireAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      userId: req.session.userId,
      status: 'active'
    }).sort({ date: 1, time: 1 });
    
    res.render('dashboard', { reservations });
  } catch (error) {
    res.render('dashboard', { reservations: [], error: 'Failed to load reservations' });
  }
});

// Create reservation page - requires branch parameter
router.get('/create', requireAuth, async (req, res) => {
  const { branch } = req.query;
  
  if (!branch || !['Ho Man Tin Branch', 'Mong Kok Branch'].includes(branch)) {
    return res.redirect('/');
  }
  
  // Check cooldown period
  const user = await User.findById(req.session.userId);
  const now = new Date();
  let cooldownMessage = null;
  let cooldownUntil = null;
  
  if (user && user.cooldownUntil && user.cooldownUntil > now) {
    cooldownUntil = user.cooldownUntil;
    const minutesLeft = Math.ceil((user.cooldownUntil - now) / 1000 / 60);
    cooldownMessage = `You cannot make a new reservation yet. Please wait ${minutesLeft} more minute(s) due to recent cancellations.`;
  }
  
  // Get available time slots
  const timeSlots = generateTimeSlots();
  
  // Get date if provided
  const selectedDate = req.query.date || '';
  
  res.render('create-reservation', { 
    branch, 
    selectedDate,
    timeSlots,
    error: null,
    cooldownMessage,
    cooldownUntil: cooldownUntil ? cooldownUntil.toISOString() : null
  });
});

// Create reservation handler
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { branch, date, time, adults, children } = req.body;
    
    // Check cooldown period
    const user = await User.findById(req.session.userId);
    const now = new Date();
    
    if (user && user.cooldownUntil && user.cooldownUntil > now) {
      const timeSlots = generateTimeSlots();
      const minutesLeft = Math.ceil((user.cooldownUntil - now) / 1000 / 60);
      return res.render('create-reservation', { 
        branch,
        selectedDate: date,
        timeSlots,
        error: `You cannot make a new reservation yet. Please wait ${minutesLeft} more minute(s) due to recent cancellations.`,
        cooldownMessage: `You cannot make a new reservation yet. Please wait ${minutesLeft} more minute(s) due to recent cancellations.`,
        cooldownUntil: user.cooldownUntil.toISOString()
      });
    }
    
    // Validate total number of people (adults + children <= 12)
    const totalPeople = parseInt(adults) + parseInt(children || 0);
    if (totalPeople > 12) {
      const timeSlots = generateTimeSlots();
      return res.render('create-reservation', { 
        branch,
        selectedDate: date,
        timeSlots,
        error: 'Total number of people (adults + children) cannot exceed 12',
        cooldownMessage: null,
        cooldownUntil: null
      });
    }
    
    // Check if time slot is full (max 5 reservations per time slot)
    const existingReservations = await Reservation.countDocuments({
      branch,
      date: new Date(date),
      time,
      status: 'active'
    });
    
    if (existingReservations >= 5) {
      const timeSlots = generateTimeSlots();
      return res.render('create-reservation', { 
        branch,
        selectedDate: date,
        timeSlots,
        error: 'This time slot is fully booked. Please choose another time.',
        cooldownMessage: null,
        cooldownUntil: null
      });
    }
    
    // Validate date (December 2025 only)
    const selectedDate = new Date(date);
    const decStart = new Date('2025-12-01');
    decStart.setHours(0, 0, 0, 0);
    const decEnd = new Date('2025-12-31');
    decEnd.setHours(23, 59, 59, 999);
    
    if (selectedDate < decStart || selectedDate > decEnd) {
      const timeSlots = generateTimeSlots();
      return res.render('create-reservation', { 
        branch,
        selectedDate: date,
        timeSlots,
        error: 'Reservation date must be in December 2025',
        cooldownMessage: null,
        cooldownUntil: null
      });
    }
    
    const reservation = new Reservation({
      userId: req.session.userId,
      branch,
      date: selectedDate,
      time,
      adults: parseInt(adults),
      children: parseInt(children) || 0
    });
    
    await reservation.save();
    
    // Reset cooldown and consecutive deletions on successful reservation
    if (user) {
      user.consecutiveDeletions = 0;
      user.cooldownUntil = null;
      await user.save();
    }
    
    res.redirect('/reservations/list');
  } catch (error) {
    const timeSlots = generateTimeSlots();
    res.render('create-reservation', { 
      branch: req.body.branch,
      selectedDate: req.body.date,
      timeSlots,
      error: 'Failed to create reservation, please try again later',
      cooldownMessage: null,
      cooldownUntil: null
    });
  }
});

// Helper function to generate time slots
function generateTimeSlots() {
  const slots = [];
  // 12:00 - 16:00 (every 30 minutes, including 16:00)
  for (let hour = 12; hour <= 16; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 16) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  // 17:00 - 21:00 (every 30 minutes, including 21:00)
  for (let hour = 17; hour <= 21; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

// Edit reservation page
router.get('/edit/:id', requireAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.session.userId
    });
    
    if (!reservation) {
      return res.redirect('/reservations/list');
    }
    
    res.render('edit-reservation', { reservation, error: null });
  } catch (error) {
    res.redirect('/reservations/list');
  }
});

// Update reservation handler
router.post('/edit/:id', requireAuth, async (req, res) => {
  try {
    const { branch, date, time, adults, children } = req.body;
    
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.session.userId
    });
    
    if (!reservation) {
      return res.redirect('/reservations/list');
    }
    
    // Validate total number of people
    const totalPeople = parseInt(adults) + parseInt(children || 0);
    if (totalPeople > 12) {
      return res.render('edit-reservation', { 
        reservation,
        error: 'Total number of people (adults + children) cannot exceed 12' 
      });
    }
    
    // Validate date (December 2025 only)
    const selectedDate = new Date(date);
    const decStart = new Date('2025-12-01');
    decStart.setHours(0, 0, 0, 0);
    const decEnd = new Date('2025-12-31');
    decEnd.setHours(23, 59, 59, 999);
    
    if (selectedDate < decStart || selectedDate > decEnd) {
      return res.render('edit-reservation', { 
        reservation,
        error: 'Reservation date must be in December 2025' 
      });
    }
    
    reservation.branch = branch;
    reservation.date = selectedDate;
    reservation.time = time;
    reservation.adults = parseInt(adults);
    reservation.children = parseInt(children) || 0;
    
    await reservation.save();
    res.redirect('/reservations/list');
  } catch (error) {
    res.render('edit-reservation', { 
      reservation: req.body,
      error: 'Failed to update reservation, please try again later' 
    });
  }
});

// Delete reservation
router.post('/delete/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/reservations/list');
    }
    
    await Reservation.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { status: 'cancelled' }
    );
    
    // Track consecutive deletions
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    // If last deletion was more than 10 minutes ago, reset counter
    if (!user.lastDeletionTime || user.lastDeletionTime < tenMinutesAgo) {
      user.consecutiveDeletions = 1;
    } else {
      // Increment consecutive deletions
      user.consecutiveDeletions += 1;
    }
    
    user.lastDeletionTime = now;
    
    // If 3 consecutive deletions, set cooldown for 10 minutes
    if (user.consecutiveDeletions >= 3) {
      user.cooldownUntil = new Date(now.getTime() + 10 * 60 * 1000);
    }
    
    await user.save();
    res.redirect('/reservations/list');
  } catch (error) {
    res.redirect('/reservations/list');
  }
});

module.exports = router;

