import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false, // Can be null for walk-in customers
    },
    store: { type: String, enum: ["online", "offline"], required: true },

    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price per unit
        total_price: { type: Number, required: true }, // quantity * price
        gst_percentage: { type: Number, required: true }, // GST Rate (e.g., 18%)
        gst_amount: { type: Number, required: true }, // GST for this product
      },
    ],

    total_price: { type: Number, required: true }, // Before GST
    discount: { type: Number, default: 0 }, // Discount in percentage or amount

    gst_total: { type: Number, required: true }, // Total GST Amount for all products
    final_price: { type: Number, required: true }, // After discount + GST

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    invoice_created_at: { type: Date, default: Date.now },
    invoice_updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "invoice_created_at",
      updatedAt: "invoice_updated_at",
    },
  }
);

export const invoiceModel = mongoose.model("Invoice", invoiceSchema);
