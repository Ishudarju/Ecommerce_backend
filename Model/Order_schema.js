// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },
//     vendor_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendors",
//       required: true,
//     },
//     products: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         name: { type: String, required: true },
//         quantity: { type: Number, required: true },
//         price: { type: Number, required: true }, // Price at the time of order
//         total: { type: Number, required: true }// quantity * price
//       },
//     ],
//     shippingAddress: {
//       type: mongoose.Schema.Types.ObjectId, // Reference to address model
//       ref: "Address", // Reference to the Address model
//       required: true,
//     },
//     paymentMethod: {
//       type: String,
//       enum: [
//         "Credit Card",
//         "Debit Card",
//         "PayPal",
//         "Cash on Delivery",
//         "Razorpay",
//       ],
//       required: true,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Completed", "Failed"],
//       default: "Pending",
//     },
//     razorpayOrderId: {
//       type: String,
//       required: function () {
//         return this.paymentMethod === "Razorpay";
//       },
//     },
//     razorpayPaymentId: {
//       type: String,
//     },
//     razorpaySignature: {
//       type: String,
//     },
//     totalAmount: {
//       type: Number,
//       required: true,
//     },
//     orderStatus: {
//       type: String,
//       enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending",
//     },
//     deliveredAt: {
//       type: Date,
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true, // Automatically add createdAt and updatedAt fields
//   }
// );

// export const orderModel = mongoose.model("Orders", orderSchema);

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    paymentMethod: { type: String, enum: ["Razorpay", "COD"], required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    razorpayOrderId: { type: String },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // Store vendor-wise product breakdown
    vendorOrders: [
      {
        vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
        products: [
          {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            name: String,
            quantity: Number,
            price: Number,
            total: Number,
          },
        ],
        subTotal: Number, // Vendor-wise total amount
        orderStatus: { type: String, default: "Pending" },
      },
    ],
  },
  { timestamps: true }
);
export const orderModel = mongoose.model("Orders", orderSchema);
