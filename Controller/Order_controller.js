import { orderModel } from "../Model/Order_schema.js";
import { cartModel } from "../Model/Cart_schema.js";
import { addressModel } from "../Model/Address_schema.js"; // Assuming you have an Address schema
import Razorpay from "razorpay";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// export const createOrder = async (req, res) => {
//   try {
//     const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;
//     console.log(req.body);
//     // Validate request data
//     if (!cartId || !address_id) {
//       return res
//         .status(400)
//         .json({ message: "Cart ID and Address ID are required" });
//     }

//     // Retrieve the cart
//     const cart = await cartModel
//       .findById(cartId)
//       .populate("items.product", "name price");
//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist" });
//     }
//     // Retrieve the shipping address
//     const shippingAddress = await addressModel.findById(address_id);
//     console.log(shippingAddress);
//     if (!shippingAddress) {
//       return res.status(404).json({ message: "Shipping address not found" });
//     }

//     // Map cart items to order products and calculate total amount
//     const orderProducts = cart.items.map((item) => ({
//       productId: item.product._id,
//       name: item.product.name,
//       quantity: item.quantity,
//       price: item.price,
//       total: item.quantity * item.price,
//     }));
//     const totalAmount = orderProducts.reduce(
//       (sum, item) => sum + item.total,
//       0
//     );
//     console.log(orderProducts);
//     console.log(totalAmount);

//     // Razorpay order creation (if payment method is Razorpay)
//     let razorpayOrderId = null;
//     if (paymentMethod === "Razorpay") {
//       const razorpayOrder = await razorpayInstance.orders.create({
//         amount: totalAmount * 100, // Convert to paisa
//         currency: "INR",
//         receipt: `order_${Date.now()}`,
//       });
//       razorpayOrderId = razorpayOrder.id;
//     }

//     // Prepare order data
//     const orderData = {
//       userId: cart.user,
//       products: orderProducts,
//       shippingAddress: address_id,
//       paymentMethod,
//       razorpayOrderId,
//       totalAmount,
//     };

//     // Save the order to the database
//     const order = await orderModel.create(orderData);

//     // Delete the cart after successful order creation
//     await cartModel.findByIdAndDelete(cartId);

//     return res.status(201).json({
//       message: "Order created successfully",
//       order,
//     });
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({ message: "Failed to create order", error });
//   }
// };

// export const createOrder = async (req, res) => {
//   try {
//     const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;
//     console.log(req.body);

//     if (!cartId || !address_id) {
//       return res
//         .status(400)
//         .json({ message: "Cart ID and Address ID are required" });
//     }

//     // Retrieve the cart
//     const cart = await cartModel
//       .findById(cartId)
//       .populate("items.product", "name price vendor total_stock");
//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist" });
//     }

//     // Retrieve the shipping address
//     const shippingAddress = await addressModel.findById(address_id);
//     if (!shippingAddress) {
//       return res.status(404).json({ message: "Shipping address not found" });
//     }

//     // Map cart items to order products and calculate total amount
//     const orderProducts = cart.items.map((item) => ({
//       productId: item.product._id,
//       name: item.product.name,
//       vendor_id: item.product.vendor_id, // Fetch vendor ID from the product
//       quantity: item.quantity,
//       price: item.price,
//       total: item.quantity * item.price,
//     }));

//     const totalAmount = orderProducts.reduce(
//       (sum, item) => sum + item.total,
//       0
//     );

//     // Group products by vendor
//     const vendorOrders = {};
//     orderProducts.forEach((product) => {
//       if (!vendorOrders[product.vendor_id]) {
//         vendorOrders[product.vendor_id] = [];
//       }
//       vendorOrders[product.vendor_id].push(product);
//     });

//     // Razorpay order creation
//     let razorpayOrderId = null;
//     if (paymentMethod === "Razorpay") {
//       const razorpayOrder = await razorpayInstance.orders.create({
//         amount: totalAmount * 100, // Convert to paisa
//         currency: "INR",
//         receipt: `order_${Date.now()}`,
//       });
//       razorpayOrderId = razorpayOrder.id;
//     }
// console.log(vendorOrders);
//     // Save separate orders for each vendor
//     const createdOrders = [];
//     for (const [vendor, products] of Object.entries(vendorOrders)) {
//       const orderData = {
//         userId: cart.user,
//         vendor, // Associate vendor with the order
//         products,
//         shippingAddress: address_id,
//         paymentMethod,
//         razorpayOrderId,
//         totalAmount: products.reduce((sum, item) => sum + item.total, 0),
//       };

//       const order = await orderModel.create(orderData);
//       createdOrders.push(order);

//       // **Update product stock** after order creation
//       for (const product of products) {
//         await productModel.findByIdAndUpdate(
//           product.productId,
//           { $inc: { total_stock: -product.quantity } },
//           { new: true }
//         );
//       }
//     }

//     // Delete the cart after successful order placement
//     await cartModel.findByIdAndDelete(cartId);

//     return res.status(201).json({
//       message: "Orders created successfully",
//       orders: createdOrders,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Failed to create order", error });
//   }
// };

export const createOrder = async (req, res) => {
  try {
    const { cartId, address_id, paymentMethod = "Razorpay" } = req.body;

    if (!cartId || !address_id) {
      return res
        .status(400)
        .json({ message: "Cart ID and Address ID are required" });
    }

    // Retrieve the cart
    const cart = await cartModel
      .findById(cartId)
      .populate("items.product", "name price vendor_id total_stock");

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or does not exist" });
    }

    // Retrieve the shipping address
    const shippingAddress = await addressModel.findById(address_id);
    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // Map cart items to order products and calculate total amount
    const orderProducts = cart.items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      vendor_id: item.product.vendor_id, // Fetch vendor ID correctly
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    }));

    // Calculate total order amount
    const totalAmount = orderProducts.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // Group products by vendor
    const vendorOrders = {};
    orderProducts.forEach((product) => {
      if (!vendorOrders[product.vendor_id]) {
        vendorOrders[product.vendor_id] = [];
      }
      vendorOrders[product.vendor_id].push(product);
    });

    // Initialize Razorpay order ID
    let razorpayOrderId = null;
    if (
      paymentMethod === "Razorpay" &&
      typeof razorpayInstance !== "undefined"
    ) {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
        payment_capture: 1,
      });
      razorpayOrderId = razorpayOrder.id;
    }

    // Create separate orders for each vendor
    const orders = await Promise.all(
      Object.keys(vendorOrders).map(async (vendorId) => {
        return orderModel.create({
          userId: cart.user,
          vendor_id: vendorId,
          products: vendorOrders[vendorId],
          shippingAddress: address_id,
          paymentMethod,
          paymentStatus: paymentMethod === "Razorpay" ? "Pending" : "Completed",
          razorpayOrderId,
          totalAmount: vendorOrders[vendorId].reduce(
            (sum, item) => sum + item.total,
            0
          ),
          orderStatus: "Pending",
        });
      })
    );

    // Clear cart after order placement
    await cartModel.findByIdAndDelete(cartId);

    return res.status(201).json({
      message: "Order placed successfully",
      orders,
      razorpayOrderId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // const order = await orderModel.findById(orderId).populate("products.productId")..populate({
    //   path: "products.productId",
    //   populate: {
    //     path: "reviews",
    //     model: "Review",
    //   };
    const order = await orderModel
      .findById(orderId)
      .populate({
        path: "products.productId",
        model: "Product",
      })
      .populate({
        path: "products.productId",
        populate: {
          path: "reviews",
          model: "Review",
        },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve order", error });
  }
};

// 3. Update an Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update status fields
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    // Save the updated order
    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Order updated successfully",
      updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order", error });
  }
};

// 4. Delete an Order
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete order", error });
  }
};

// 5. Get all Orders for a User
// export const getOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     console.log(userId);
//     const orders = await orderModel
//       .find({ userId })
//       .populate("products.productId");

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }
//     console.log(orders);
//     return res.status(200).json(orders);
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Failed to retrieve orders", error });
//   }
// };
// export const getOrdersByUser = async (req, res) => {
//   try {
//     const userId = req.body.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel.find({ userId }).populate("products.productId");
//     console.log(orders);
//     if (!orders.length) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     // Fetch reviews separately for each product
//     const ordersWithReviews = await Promise.all(
//       orders.map(async (order) => {
//         const productsWithReviews = await Promise.all(
//           order.products.map(async (product) => {
//             console.log(product.productId._id)
//             const reviews = await reviewModel.find({ product_id: product.productId._id });
//             return { ...product.toObject(), reviews };
//           })
//         );
//         return { ...order.toObject(), products: productsWithReviews };
//       })
//     );

//     return res.status(200).json(ordersWithReviews);
//   } catch (error) {
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };

// export const getOrdersByUser = async (req, res) => {
//   try {
//     const userId = req.body.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel
//       .find({ userId })
//       .populate({
//         path: "products.productId",
//         populate: {
//           path: "reviews",
//           model: "Review",
//         },
//       });

//     if (!orders.length) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     // Ensure products without reviews return an empty array
//     const ordersWithReviews = orders.map((order) => {
//       const updatedProducts = order.products.map((product) => {
//         return {
//           ...product.toObject(),
//           productId: {
//             ...product.productId.toObject(),
//             reviews: product.productId.reviews || [], // Ensure reviews are an empty array if undefined
//           },
//         };
//       });

//       return {
//         ...order.toObject(),
//         products: updatedProducts,
//       };
//     });

//     return res.status(200).json(ordersWithReviews);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };
// export const getOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel.aggregate([
//       {
//         $match: { userId: new mongoose.Types.ObjectId(userId) }, // Match orders by user ID
//       },
//       {
//         $unwind: "$products", // Flatten products array for aggregation
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$productDetails",
//           preserveNullAndEmptyArrays: true, // Keep orders even if product details are missing
//         },
//       },
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "products.productId",
//           foreignField: "product_id",
//           as: "reviews",
//         },
//       },
//       {
//         $addFields: {
//           averageRating: { $avg: "$reviews.rating" }, // Calculate the average rating
//           totalReviews: { $size: "$reviews" }, // Count total reviews
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           userId: { $first: "$userId" },
//           status: { $first: "$status" },
//           totalPrice: { $first: "$totalPrice" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           products: {
//             $push: {
//               productId: "$products.productId",
//               quantity: "$products.quantity",
//               productDetails: "$productDetails",
//               averageRating: "$averageRating",
//               totalReviews: "$totalReviews",
//             },
//           },
//         },
//       },
//     ]);

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     return res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error retrieving orders:", error);
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };

// export const getOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const orders = await orderModel.aggregate([
//       {
//         $match: { userId: new mongoose.Types.ObjectId(userId) }, // Match orders by user ID
//       },
//       {
//         $unwind: "$products", // Flatten products array for aggregation
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$productDetails",
//           preserveNullAndEmptyArrays: true, // Keep products even if details are missing
//         },
//       },
//       {
//         $lookup: {
//           from: "reviews",
//           let: { productId: "$products.productId", userId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$product_id", "$$productId"] }, // Match product
//                     { $eq: ["$user_id", "$$userId"] } // Match the same user
//                   ]
//                 }
//               }
//             },
//             { $project: { rating: 1, comment: 1, _id: 0 } } // Only keep rating and comment
//           ],
//           as: "userReview",
//         },
//       },
//       {
//         $addFields: {
//           userRating: { $arrayElemAt: ["$userReview.rating", 0] }, // Get the user's rating
//           userComment: { $arrayElemAt: ["$userReview.comment", 0] }, // Get the user's comment
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           userId: { $first: "$userId" },
//           status: { $first: "$status" },
//           totalPrice: { $first: "$totalPrice" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           products: {
//             $push: {
//               productId: "$products.productId",
//               quantity: "$products.quantity",
//               productDetails: "$productDetails",
//               userRating: "$userRating",
//               userComment: "$userComment",
//             },
//           },
//         },
//       },
//     ]);

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     return res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error retrieving orders:", error);
//     return res.status(500).json({ message: "Failed to retrieve orders", error });
//   }
// };
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await orderModel.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "reviews",
          let: { productId: "$products.productId", userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$product_id", "$$productId"] },
                    { $eq: ["$user_id", "$$userId"] },
                  ],
                },
              },
            },
            { $project: { rating: 1, comment: 1, _id: 0 } },
          ],
          as: "userReview",
        },
      },
      {
        $addFields: {
          userRating: { $arrayElemAt: ["$userReview.rating", 0] },
          userComment: { $arrayElemAt: ["$userReview.comment", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          razorpayOrderId: { $first: "$razorpayOrderId" },
          status: { $first: "$orderStatus" },
          totalPrice: { $first: "$totalAmount" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          products: {
            $push: {
              productId: "$products.productId",
              name: "$products.name",
              quantity: "$products.quantity",
              price: "$products.price",
              total: "$products.total",
              productDetails: "$productDetails",
              userRating: "$userRating",
              userComment: "$userComment",
            },
          },
        },
      },
    ]);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No delivered orders found for this user" });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error retrieving orders:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve orders", error });
  }
};

// 6. Verify Razorpay Payment Signature (for Payment Verification)
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const expectedSignature = razorpayInstance.utility.verifyPaymentSignature({
      payment_id: razorpayPaymentId,
      order_id: razorpayOrderId,
      signature: razorpaySignature,
    });

    if (expectedSignature) {
      // Mark order as paid
      const order = await orderModel.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: "Completed" },
        { new: true }
      );

      return res.status(200).json({
        message: "Payment verified successfully",
        order,
      });
    } else {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Payment verification failed", error });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // Retrieve all orders from the database
    const orders = await orderModel
      .find()
      .populate("userId")
      .populate("products.productId"); // Assuming Order has references to 'userId' and 'products.productId'

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Respond with the list of orders
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

export const VendorOrders = async (req, res) => {

}
