const errorHandler = require("../middlewares/errorMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { loginSchema } = require("../schemas/authSchema");
const passport = require("../config/passport");

const login = async (req, res, next) => {
  const data = loginSchema.parse(req.body);
  const { email, password } = data;

  try {
    const user = await User.findByEmail(email);
    if (!user || user.password !== password) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      return next(error);
    }

    //ask Fahad about password hashing
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   const error = new Error('Invalid credentials');
    //   error.status = 401;
    //   return next(error);
    // }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    next(error);
  }
};

const authenticate = (req, res) => {
  if (req.user) {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.redirect(
      `${process.env.DEPLOY_FRONTEND_URL}/auth/callback?token=${token}`
    );
    // res.redirect(my app component);
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  login,
  authenticate,
};
