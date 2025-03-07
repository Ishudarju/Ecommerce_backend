import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../Model/user_schema.js";
import { productModel } from "../Model/Product_schema.js";
import { orderModel } from "../Model/Order_schema.js";

// Adjust the path to your user model

export const authMiddleware = async (req, res, next) => {
  let token = req.headers["authorization"] ? req.headers["authorization"] : "";

  // Remove Bearer prefix if it exists
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Token not provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited"
    );
    console.log(decoded);
    // Find the user in the database
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if the user has the required role
    if (user.role !== decoded.role) {
      return res.status(403).json({
        status: false,
        message: "Access denied: insufficient privileges",
      });
    }

    // Attach the user to the request object for later use
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: false, statusCode: 700, message: "Token expired" });
    } else {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await userModel?.findOne({ email });
    // console.log(user);
    if (!user && user.role != " admin") {
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
        expiresIn: "24h", // Token expiration time
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

// export const admin_dashboard = async (req, res) => {

// }
export const admin_dashboard = async (req, res) => {
  try {
    // Count users
    const userCount = await userModel.countDocuments({ is_deleted: false });

    // Count products
    const productCount = await productModel.countDocuments({
      is_deleted: false,
    });

    // Count orders
    const orderCount = await orderModel.countDocuments();

    // Calculate total sales amount
    const totalSales = await orderModel.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // Count out of stock products
    const outOfStockCount = await productModel.countDocuments({ stock: 0 });

    return res.status(200).json({
      status: true,
      data: {
        userCount,
        productCount,
        orderCount,
        totalSales: totalSales[0]?.total || 0,
        outOfStockCount,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};
