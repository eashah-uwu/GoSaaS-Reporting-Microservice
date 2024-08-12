const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const logger = require('../logger');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info('Google OAuth callback received');
    logger.info('Google profile:', profile);

    const email = profile.emails[0].value;
    const name = profile.displayName;


    // Find user by email from Google profile
    let user = await User.findByEmail(email);
    if (user) {
      logger.info('User found:', user);
      // User exists, proceed with login
      return done(null, user);
    } else {
      logger.warn('User not found for email:', email);
      // User does not exist, create a new account
      user = await User.create({
        email: email,
        name: name,
      });
      logger.info('New user created:', user);
      return done(null, user);
    }
  } catch (error) {
    logger.error('Error in Google OAuth strategy:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  try {
    logger.info('Serializing user:', user);
    done(null, user.userid); // Serialize the user ID into the session
  } catch (error) {
    logger.error('Error serializing user:', error);
    done(error, null);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      logger.warn('User not found for ID:', id);
      return done(new Error("User not found"), null);
    }
    logger.info('Deserializing user:', user);
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
