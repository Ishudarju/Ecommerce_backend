import { reviewModel } from "../Model/Review_schema.js";
import { productModel } from "../Model/Product_schema.js";
import { vendorModel } from "../Model/Vendor_schema.js";
import { userModel } from "../Model/user_schema.js";

export const createReview = async (req, res) => {
  try {
    const { productId	, rating, reviewText } = req.body;
    const { id: user_id } = req.user; // Extract user ID from authenticated user

    // Check if product exists
    const productExists = await productModel.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if vendor exists
    const vendorExists = await vendorModel.findById(productExists.vendor_id);
    if (!vendorExists) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Fetch user details
    const user = await userModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new review
    const newReview = await reviewModel.create({
      product_id:productId,
      vendor_id:vendorExists._id,
      user_id,
      reviewer: user._id, // Assuming 'name' is a field in user model
      rating,
      comment:reviewText,
    });

    return res
      .status(201)
      .json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get all reviews for a product
export const getReviewsByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Fetch reviews with user details
    const reviews = await reviewModel
      .find({ product_id })
      .populate("user_id", "name");

    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product" });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get all reviews by a specific user
export const getReviewsByUser = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    // Fetch reviews with product details
    const reviews = await reviewModel
      .find({ user_id })
      .populate("product_id", "name");

    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this user" });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { id: user_id } = req.user;

    // Find review
    const review = await reviewModel.findOne({ _id: review_id, user_id });

    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    await reviewModel.findByIdAndDelete(review_id);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find()
      .populate("product_id", "name") // Populate product name
      .populate("vendor_id", "name") // Populate vendor name
      .populate("user_id", "name"); // Populate user name

    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found" });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get a review by ID
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params; // Extract review ID from request parameters

    const review = await reviewModel
      .findById(reviewId)
      .populate("product_id", "name") // Populate product name
      .populate("vendor_id", "name") // Populate vendor name
      .populate("user_id", "name"); // Populate user name

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
// Update a review by ID
export const updateReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params; // Extract review ID from request parameters
    const { rating, comment } = req.body; // Get updated review data

    // Find and update the review
    const updatedReview = await reviewModel.findByIdAndUpdate(
      reviewId,
      { $set: { rating, comment, date: Date.now() } },
      { new: true } // Return updated document
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res
      .status(200)
      .json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Delete a review by ID
export const deleteReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params; // Extract review ID from request parameters

    const deletedReview = await reviewModel.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
