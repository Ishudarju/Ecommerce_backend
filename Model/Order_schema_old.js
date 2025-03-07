import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price at the time of order
        total: { type: Number, required: true }  // quantity * price
      }
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    deliveredAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

export const orderModel = mongoose.model('Order', orderSchema);
// module.exports = Order;

