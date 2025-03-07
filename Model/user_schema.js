import mongoose from "mongoose";

// Define the schema for the contact form
const userSchema = new mongoose.Schema(
  {
    name: { type: String,required: true, },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        return this.customer_type === "online";
      },

    },
    customer_type: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
      required: true,
    },
    phone_number: { type: String },
    otp: { type: String }, // Store OTP temporarily
    otp_expiry: { type: Date, default: Date.now }, // OTP expiration time
    otp_verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["customer", "admin", "vendor"],
      default: "customer",
    },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create the model from the schema and export it
export const userModel = mongoose.model("users", userSchema);
