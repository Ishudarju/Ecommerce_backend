import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../Model/user_schema.js";
import * as Address from "./Address_Controller.js";

// Middleware to authenticate JWT
export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Token not provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
    (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ status: false, statusCode: 700, message: "Token expired" });
        } else {
          return res
            .status(401)
            .json({ status: false, message: "Invalid token" });
        }
      }

      req.user = decoded;
      next();
    }
  );
};

// Function to handle user login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ email });

    // console.log(user);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Compare the password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
      {
        expiresIn: "1h", // Token expiration time
      }
    );
    // console.log(token);

    // Respond with the token and user info
    return res
      .status(200)
      .header("auth-token", token)
      .json({
        status: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req?.body;
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if email is already in use
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone_number,
      role: "customer",
      customer_type: "online",
      // address,
    });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        role: "customer",
        // address: newUser.address,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  if (req.user.role == "admin") {
    try {
      const alluser = await userModel.find({});
      // console.log(alluser);
      if (alluser) {
        return res.status(200).json({ message: "Users Data", alluser });
      } else {
        return res.status(400).json({ message: "No User Found" });
      }
    } catch (err) {
      return res.status(500).json({ message: "internal Server Error" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized Access" });
  }
};

export const getUserById = async (req, res) => {
  console.log(req.body);

  if (req.user.role === "customer") {
    try {
      const { UserId } = req.body;

      // Check if userId is provided
      if (!UserId) {
        return res
          .status(400)
          .json({ status: false, message: "User ID is required" });
      }

      const user = await userModel.findOne({ _id: UserId }).select("-password");

      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "No User Found" });
      } else {
        return res
          .status(200)
          .json({ status: true, message: "User Found", user });
      }
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    // Find the user by ID or other unique parameter
    const user = await userModel.findById(userId);

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Soft delete the user by setting is_deleted to true
    user.is_deleted = true;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "User marked as deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  if (req.user.role === "customer") {
    try {
      const { name, email, phone_number, address } = req.body;
      console.log(req.body);
      // console.log(req.params);
      // Update user information
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user.id, // Assuming req.user contains the authenticated user's ID
        { name, email, phone_number },
        { new: true, runValidators: true }
      );
      if (updateUser.length == 0) {
        return res.json("user not updated");
      }
      console.log(updatedUser);
      // Check if the address field is present in the request body
      if (address) {
        if (address._id) {
          await Address.updateAddress(req, res);
        }
        await Address.addAddress(req, res);
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can update their information",
    });
  }
};

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

// Send OTP via mock (no actual SMS sending in this dummy example)
const sendOTP = (phone_number, otp) => {
  console.log(`OTP sent to ${phone_number}: ${otp}`);
};

// Mobile login with OTP functionality
// export const mobileLogin = async (req, res) => {
//   try {
//     const { phone_number } = req.body;
//     console.log(req.body);
//     if (!phone_number) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Phone number is required" });
//     }

//     // Find user by phone number
//     const user = await userModel.findOne({ phone_number });

//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }

//     // Generate OTP and send it to the user's phone number (mocked)
//     // const otp = generateOTP();
//     const otp ="123456";
//     sendOTP(phone_number, otp);

//     // Update OTP without triggering validation
//     await userModel.updateOne({ _id: user._id }, { $set: { otp } });

//     return res.status(200).json({
//       status: true,
//       message: "OTP sent successfully. Please check your phone.",
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ status: false, message: "Internal server error", error });
//   }
// };

export const mobileLogin = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ status: false, message: "Phone number is required" });
    }

    // Check if user exists
    let user = await userModel.findOne({ phone_number });
    const isNewUser = !user;

    // Generate OTP
    const otp = "123456"; // Replace with actual OTP generation logic

    // Send OTP (handle potential errors)
    try {
      sendOTP(phone_number, otp);
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({ status: false, message: "Failed to send OTP" });
    }

    if (!user) {
      // Create a minimal user record for new users
      user = new userModel({
        phone_number,
        otp,
        otp_expiry: new Date(Date.now() + 5 * 60 * 1000),
        name: "Guest User", // Temporary default
        email: `${phone_number}@guest.com`, // Temporary email
        password: "default_password", // Temporary password
      });
      await user.save();
    } else {
      // Update OTP for existing users
      await userModel.updateOne(
        { phone_number },
        { $set: { otp, otp_expiry: new Date(Date.now() + 5 * 60 * 1000) } }
      );
    }

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully.",
      is_new_user: isNewUser,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ status: false, message: "Internal server error", error: error.message });
  }
};


// Verify OTP and login the user
// export const verifyOTPAndLogin = async (req, res) => {
//   try {
//     const { phone_number, otp } = req.body;

//     if (!phone_number || !otp) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Phone number and OTP are required" });
//     }

//     // Find user by phone number
//     const user = await userModel.findOne({ phone_number });

//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }

//     // Check if OTP matches
//     if (user.otp !== otp) {
//       return res.status(400).json({ status: false, message: "Invalid OTP" });
//     }

//     // Clear OTP after successful validation (In production, use OTP expiration time)
//     user.otp = null;
//     await user.save();

//     // Generate a JWT token after successful OTP validation
//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
//       { expiresIn: "1h" }
//     );

//     return res.status(200).json({
//       status: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone_number: user.phone_number,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ status: false, message: "Internal server error", error });
//   }
// };
export const verifyOTPAndLogin = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res
        .status(400)
        .json({ status: false, message: "Phone number and OTP are required" });
    }

    // Find OTP record in DB
    let user = await userModel.findOne({ phone_number });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (user.otp_expiry && new Date() > user.otp_expiry) {
      return res
        .status(400)
        .json({
          status: false,
          message: "OTP expired. Please request a new one.",
        });
    }

    let isNewUser = false;

    // If user is new, create an account now
    if (!user.name) {
      // Assuming 'name' is required for existing users
      isNewUser = true;
      user = new userModel({
        phone_number,
        role: "customer", // Default role
      });
      await user.save();
    }

    // Clear OTP after successful validation
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, phone_number: user.phone_number, role: user.role },
      process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      is_new_user: isNewUser, // Confirm if it's a new user
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number,
        role: user.role || "customer",
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

export const offlineuser = async (req, res) => {
  try {
    const { name, email, phone_number } = req?.body;
    // Validate required fields
    if (!name || !email || !phone_number) {
      return res.status(400).json({
        status: false,
        message: "Name, email are required",
      });
    }

    // Check if email is already in use
    const existingUser = await userModel.findOne({ phone_number });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "phone number is already in use" });
    }
    // Create the new user
    const newUser = new userModel({
      name,
      email,
      phone_number,
      role: "customer",
      customer_type: "offline",
      // address,
    });
    // Save the user to the database
    await newUser.save();
    return res.status(201).json({
      status: true,
      message: "User created successfully",
    });
  } catch {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
