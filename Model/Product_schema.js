import mongoose from "mongoose";
import { type } from "os";

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true, // Ensure product_id is unique
      unique: true, // Make sure the product_id is unique
    },
    name: {
      type: String,
      required: true, // Product name
    },
    gender: {
      type: String,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true, // Reference to category
    },
    sub_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subcategories",
      required: true, // Reference to subcategory
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendors",
      required: true, // Reference to vendor
    },
    total_stock: {
      type: Number,
      required: true, // Total stock across all variants
      min: 0, // Must be non-negative
    },
    color: {
      type: String,
      required: true, // Color attribute for the variant
    },
    variants: [
      {
        variant_id: {
          type: String,
          required: true, // Unique identifier for each variant
        },
        size: {
          type: String,
          required: true, // Size attribute for the variant
        },
        stock: {
          type: Number,
          required: true, // Stock for this particular variant
          min: 0, // Must be non-negative
        },
        is_out_of_stock: {
          type: Boolean,
          default: false, // Track if the variant is out of stock
        },
      },
    ],
    product_details: [
      {
        detail_id: {
          type: String,
          required:false, // Unique identifier for each detail set
        },
        sleeve_details: {
          type: String,
          required: false, // Optional sleeve information
        },
        material_type: {
          type: String,
          required: false, // Material type of the product
        },
        pattern_type: {
          type: String,
          required: false, // Pattern type of the product
        },
        fit_type: {
          type: String,
          required: false, // Fit type of the product
        },
      },
    ],
    description: {
      type: String,
      required: false, // Product description
    },
    country_of_origin: {
      type: String,
      required: true, // Country where the product is made
    },
    seller_details: {
      name: {
        type: String,
        required: true, // Seller's name
      },
      location: {
        type: String,
        required: true, // Seller's location
      },
      reviews: {
        type: Number,
        default: 0, // Seller's average rating
        min: 0,
        max: 5,
      },
      grievance_details: {
        type: String,
        required: false, // Seller's grievance policy or contact details
      },
      policy: {
        type: String,
        required: false, // Seller's policy details (return, refund, etc.)
      },
    },
    MRP: {
      type: Number,
      required: true, // Maximum retail price
      min: 0, // Must be non-negative
    },
    selling_price: {
      type: Number,
      required: true,
      min: 0, // Must be non-negative
    },
    offer_percentage: {
      type: Number,
      default: 0, // Discount percentage
        },
    final_price: {
      type: Number,
      required: true, // Final price after applying the offer
      min: 0, // Must be non-negative
    },
    gst_percentage: {
      type: Number,
      required: true, // GST percentage
      min: 0, // Must be non-negative
      max: 100, // Should not exceed 100
    },
    gst:{
      type: Number,
      required: true, // GST amount
      min: 0, // Must be non-negative
    },
    price_with_gst: {
      type: Number,
      required: true, // Price including GST
      min: 0, // Must be non-negative
    },
    images: [String], // Array of image URLs
    rating: {
      type: Number,
      default: 0,
      min: 0, // Must be non-negative
      max: 5, // Rating should not exceed 5
    },
    // storeType: {
    //   type: String,
    //   enum: ["online", "offline", "both"], // Specifies the store type
    //   default: "online", // Default is online store
    // },
    is_deleted: {
      type: Boolean,
      default: false, // Track if the product is deleted
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

export const productModel = mongoose.model("Product", productSchema);
