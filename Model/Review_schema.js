import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true, // Reference to the reviewed product
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendors",
    required: true, // Reference to the vendor
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true, // Reference to the user who wrote the review
  },
  reviewer: {
    type: String,
    required: true, // Name of the reviewer
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, // Ensure rating is between 1 and 5
  },
  comment: {
    type: String,
    required: true, // Review comment
  },
  date: {
    type: Date,
    default: Date.now, // Default to current date
  },
});

export const reviewModel = mongoose.model("Review", reviewSchema);


