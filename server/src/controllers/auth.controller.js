import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const generateToken = (id) => {
  const gentoken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return gentoken;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const hashedpassword = await existUser.comparePassword(password);
    if (!hashedpassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }
    const token = generateToken(existUser._id);
    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: existUser._id,
          name: existUser.name,
          email: existUser.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};
