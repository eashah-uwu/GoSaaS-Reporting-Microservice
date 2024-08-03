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

    // Find user by email from Google profile
    const user = await User.findByEmail(profile.emails[0].value);
    if (user) {
      logger.info('User found:', user);
      // User exists, proceed with login
      return done(null, user);
    } else {
      logger.warn('User not found for email:', profile.emails[0].value);
      // User does not exist, handle this scenario
      return done(null, false, { message: 'User not found' });
    }
  } catch (error) {
    logger.error('Error in Google OAuth strategy:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  try {
    console.log("Serializing user:", user);
    logger.info('Serializing user:', user);
    done(null, user.userid); // Serialize the user ID into the session
    console.log("Serialized user ID:", user.userid);
  } catch (error) {
    logger.error('Error serializing user:', error);
    done(error, null);
  }
});

passport.deserializeUser(async (id, done) => {
    console.log("Deserializing user ID:", id);
    try {
      const user = await User.findById(id);
      if (!user) {
        console.error("User not found:", id);
        return done(new Error("User not found"), null);
      }
      console.log("Deserialized user:", user);
      done(null, user);

    } catch (error) {
      console.error("Deserialization error:", error);
      done(error, null);
    }
  });
  

module.exports = passport;