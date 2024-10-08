const errorHandler = require("../middlewares/errorMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { loginSchema } = require("../schemas/authSchema");
const { StatusCodes } = require("http-status-codes");
const { decrypt } = require("../config/encryption");
const { z } = require("zod"); 
// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "2h" });
};

const login = async (req, res, next) => {
  try {
    // Parse and validate request body
    const data = loginSchema.parse(req.body);
    const { email, password } = data;

    // Find user by email
    const user = await User.findByEmail(email);
    const decryptedPassword = decrypt(user.password);
    if (!user || decryptedPassword !== password) {
      const error = new Error("Invalid credentials");
      error.status = StatusCodes.UNAUTHORIZED;
      return next(error);
    }

    // Generate token
    const token = generateToken(user.userid); // Use user.userid here

    // Send token and userId
    res.status(StatusCodes.OK).json({ token, userId: user.userid }); // Use user.userid here
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    next(error);
  }
};

const authenticate = (req, res) => {
  if (req.user) {
    const userEmail = req.user.email;
    const domain = userEmail.split('@')[1]; // Extract domain

    if (domain === 'gosaas.io') {
      const token = generateToken(req.user.userid); 
      res.redirect(
        `${process.env.DEPLOY_FRONTEND_URL}/auth/callback?token=${token}&userId=${req.user.userid}` // Use req.user.userid here
      );
    } else {
      res.redirect(
        `${process.env.DEPLOY_FRONTEND_URL}/login?error=UnauthorizedDomain`
      );
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not authenticated" });
  }
};


module.exports = {
  login,
  authenticate,
};
