const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

//TODOS: Implement JWT token generation and return it in the response
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP to database using the OTP schema
      await OTP.findOneAndUpdate(
        { email },
        { otp, createdAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      // Welcome Mail after successful registration with OTP
      const message = `Welcome to deepshop. Your OTP for deepshop registration is: ${otp}. Please do not share this OTP with anyone. It is valid for 5 minutes.`;
      await sendEmail(email, "deepshop Registration OTP", message);

      res.status(201).json({
        message:
          "Registration Successful! Please check your email for the verification OTP.",
        email: user.email,
        isVerified: false,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if user is verified
      if (!user.isVerified) {
        return res.status(400).json({
          message: "Please verify your email first.",
          isVerified: false,
          email: user.email,
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP has expired or is invalid" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Delete OTP record since verification was successful
    await OTP.deleteOne({ email });

    res.status(200).json({
      message: "Email verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/update OTP
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const message = `Your new OTP for deepshop registration is: ${otp}. Please do not share this OTP with anyone. It is valid for 5 minutes.`;
    await sendEmail(email, "deepshop Registration OTP (Resent)", message);

    res.status(200).json({ message: "OTP has been resent to your email" });
  } catch (error) {
    console.error("Error in OTP resend:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  verifyOTP,
  resendOTP,
};
