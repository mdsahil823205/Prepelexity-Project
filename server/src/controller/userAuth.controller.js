import { json } from "express";
import userModel from "../model/user.model.js";
import sendMail from "../services/mail.service.js";
import jwt from "jsonwebtoken";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const isAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (isAlreadyExist) {
      return res
        .status(400)
        .json({ message: "user already exist", status: false });
    }
    const user = await userModel.create({
      username,
      email,
      password,
    });
    const emailVerificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1d" },
    );
    res.cookie("emailVerificationToken", emailVerificationToken, {
      httpOnly: false, // set to true for production
      secure: false, // set to true for production
      sameSite: "lax", // set to 'strict' for production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    await sendMail({
      to: user.email,
      subject: "Welcome to PrepLexity",
      text: "Welcome to PrepLexity",
      html: `
               <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The Perplexity Team</p>
            `,
    });
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(201).json({
      message: "user created successfully",
      status: true,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify user email
 * @route GET /api/auth/verify-email
 * @access Public
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res
      .status(400)
      .json({ message: "token is required", status: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        status: false,
        err: "user not found",
      });
    }
    user.verified = true;
    await user.save();
    const html = `
    <main style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: white;">
    <h1 style="color: black;">Email Verified Successfully!</h1>
    <p style="color: black;">Your email has been verified. You can now log in to your account.</p>
    <a href="http://localhost:3000/api/auth/login" style="color: blue; text-decoration: none; font-size: 1.2rem;">Go to Login</a>
    </main>
    `;
    return res.send(html);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", status: false });
  }
};

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        sucess: false,
        message: "user not found with this email and password",
        err: "user not found with this email and password",
      });
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        sucess: false,
        message: "password is wrong please enter a correct password",
        err: "password is wrong please enter a correct password",
      });
    }
    if (!user.verified) {
      return res.status(401).json({
        sucess: false,
        message: "please verify you email id with your email before Login",
        err: "email not verified",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // set to false for development
      sameSite: "strict", // set to 'lax' for development
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(200).json({
      success: true,
      message: "login successful",
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export const getMe = async (req, res) => {
  const userId = req.user.id;
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({
      sucess: false,
      message: "user not found",
      err: "user not found",
    });
  }
  return res.status(200).json({
    success: true,
    message: "user Details fetch successfully",
    user,
  });
};

/**
 * @desc Get current logout
 * @route GET /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // set to false for development
    sameSite: "strict", // set to 'lax' for development
  });
  return res.status(200).json({
    success: true,
    message: "logout successful",
  });
};
