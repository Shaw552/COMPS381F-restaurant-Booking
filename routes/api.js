const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// GET - Get all reservations
router.get('/reservations', async (req, res) => {
  try {
    const { userId, branch, date, status } = req.query;
    const query = {};
    
    if (userId) query.userId = userId;
    if (branch) query.branch = branch;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (status) query.status = status;
    
    const reservations = await Reservation.find(query)
      .populate('userId', 'name contact email')
      .sort({ date: 1, time: 1 });
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// GET - Get single reservation
router.get('/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId', 'name contact email');
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// POST - Create reservation
router.post('/reservations', async (req, res) => {
  try {
    const { userId, branch, date, time, adults, children } = req.body;
    
    if (!userId || !branch || !date || !time || !adults) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const reservation = new Reservation({
      userId,
      branch,
      date: new Date(date),
      time,
      adults: parseInt(adults),
      children: parseInt(children) || 0
    });
    
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// PUT - Update reservation
router.put('/reservations/:id', async (req, res) => {
  try {
    const { branch, date, time, adults, children, status } = req.body;
    
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    if (branch) reservation.branch = branch;
    if (date) reservation.date = new Date(date);
    if (time) reservation.time = time;
    if (adults !== undefined) reservation.adults = parseInt(adults);
    if (children !== undefined) reservation.children = parseInt(children);
    if (status) reservation.status = status;
    
    await reservation.save();
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// DELETE - Delete reservation
router.delete('/reservations/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json({ message: 'Reservation deleted', reservation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

module.exports = router;

