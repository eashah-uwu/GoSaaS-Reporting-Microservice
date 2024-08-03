const express = require('express');
const passport = require('../config/passport');
const { login } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post("/login", login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      console.log('User authenticated:', req.user)
        if (req.user) {
        console.log('User authenticated:', req.user);
        const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
        // res.redirect(my app component );
          } else {
            console.log('User not authenticated');
            res.redirect('/login'); 
          }
    });

module.exports = router;
