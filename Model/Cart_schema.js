import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1, // Ensure the quantity is at least 1
        },
        price: {
          type: Number,
          required: true, // Store the price at the time of adding to cart
        },
        size: {
          type: String,
          required: true,
         
        },
        color: {
          type: String,
          required: true, // Store the selected color for the product
        },
      },
    ],
    total_price: {
      type: Number,
      required: true,
      min: 0, // Ensure total price is non-negative
    },
  },
  { timestamps: true }
);



export const cartModel = mongoose.model("Cart", cartSchema);
