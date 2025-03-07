import jwt from "jsonwebtoken";
import { cartModel } from "../Model/Cart_schema.js";
import { productModel } from "../Model/Product_schema.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(200)
      .json({ status: false, message: "Token not provided" });
  } // No token, allow next middleware to handle

  jwt.verify(
    token,
    process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
    (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ status: false, statusCode: 700, message: "Token expired" });
        } else {
          return res
            .status(401)
            .json({ status: false, message: "Invalid token" });
        }
      }

      req.user = decoded; // Set the user info from the token
      next();
    }
  );
};

// export const createCart = async (req, res) => {
//   const { productId, quantity, size, color } = req.body;

//   try {
//     // Ensure user is logged in
//     if (!req.user?.id) {
//       return res
//         .status(401)
//         .json({ message: "User must be logged in to add items to the cart" });
//     }

//     // Check if product exists and validate attributes
//     const product = await productModel
//       .findById(productId)
//       .select("MRP variants total_stock is_deleted");
//     if (!product || product.is_deleted) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Validate size and color
//     const variant = product.variants.find((v) => v.size === size);
//     console.log(variant);
//     if (!variant) {
//       return res
//         .status(400)
//         .json({ message: "Invalid size or color selected" });
//     }

//     // Ensure price exists for the variant
//     // if (!variant.price) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: "Price not available for selected variant" });
//     // }

//     // Check if requested quantity is available
//     if (variant.stock < quantity) {
//       return res
//         .status(400)
//         .json({ message: "Requested quantity exceeds available stock" });
//     }

//     // Find or create the user's cart
//     let cart = await cartModel.findOne({ user: req.user.id });
//     if (!cart) {
//       cart = new cartModel({ user: req.user.id, items: [] });
//     }

//     // Ensure cart.items is initialized as an array
//     if (!Array.isArray(cart.items)) {
//       cart.items = [];
//     }

//     // Check if the product is already in the cart
//     const existingProductIndex = cart.items.findIndex(
//       (item) =>
//         item.product.toString() === productId &&
//         item.size === size &&
//         item.color === color
//     );

//     if (existingProductIndex > -1) {
//       // Convert quantities to numbers and then add them
//       cart.items[existingProductIndex].quantity =
//         Number(cart.items[existingProductIndex].quantity) + Number(quantity);
//     } else {
//       // Add new product to cart with price
//       cart.items.push({
//         product: productId,
//         quantity,
//         price: Math.floor(product.final_price), // Store price at the time of adding to cart
//         size,
//         color,
//       });
//     }

//     // Calculate total price
//     cart.total_price = cart.items.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );

//     // Save cart
//     await cart.save();

//     return res
//       .status(200)
//       .json({ message: "Item added to cart successfully", cart });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
export const createCart = async (req, res) => {
  const { productId, quantity, size, color } = req.body;

  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ message: "User must be logged in to add items to the cart" });
    }
    console.log(req.body)
    const product = await productModel
      .findById(productId)
      .select("final_price MRP variants total_stock is_deleted");

    if (!product || product.is_deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.find((v) => v.size === size);
    if (!variant) {
      return res
        .status(400)
        .json({ message: "Invalid size or color selected" });
    }

    if (variant.stock < quantity) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available stock" });
    }

    // Validate final_price
    const price = product.final_price
      ? Math.floor(product.final_price)
      : Math.floor(product.MRP || 0); // Fallback to MRP or 0

    if (!price || isNaN(price)) {
      return res
        .status(400)
        .json({ message: "Price information is invalid or unavailable" });
    }

    let cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) {
      cart = new cartModel({ user: req.user.id, items: [] });
    }

    if (!Array.isArray(cart.items)) {
      cart.items = [];
    }

    const existingProductIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingProductIndex > -1) {
      cart.items[existingProductIndex].quantity =
        Number(cart.items[existingProductIndex].quantity) + Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price,
        size,
        color,
      });
    }

    cart.total_price = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    return res
      .status(200)
      .json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const updateCartItem = async (req, res) => {
//   const { itemId, quantity } = req.body;

//   console.log("User ID: ", req.user.id);  // To check the logged-in user's ID
//   console.log("Request Body: ", req.body);  // To inspect the request body

//   if (!req.user || !req.user.id) {
//     return res.status(400).send("User not logged in");
//   }

//   try {
//     // Find the cart of the logged-in user
//     const cart = await cartModel.findOne({ user: req.user.id });

//     console.log("Cart found: ", cart); // To inspect the cart details

//     if (!cart) {
//       return res.status(404).send("No cart found for the user");
//     }

//     // Find the item in the cart
//     const itemIndex = cart.items.findIndex(
//       (item) => item.product.toString() === itemId
//     );

//     // If item exists in the cart, update the quantity
//     if (itemIndex > -1) {
//       cart.items[itemIndex].quantity = quantity;
//       await cart.save();
//       return res.status(200).send("Cart item updated successfully");
//     } else {
//       return res.status(404).send("Item not found in the cart");
//     }
//   } catch (error) {
//     console.error("Error updating cart item: ", error);
//     return res.status(500).send("Error updating cart item");
//   }
// };
export const updateCartItem = async (req, res) => {
  const { cartId, id: itemId, quantity } = req.body;

  // console.log("User ID: ", req.user.id); // To check the logged-in user's ID
  // console.log("Request Body: ", req.body); // To inspect the request body

  if (!req.user || !req.user.id) {
    return res.status(400).send("User not logged in");
  }

  try {
    // Find the cart by its ID and verify the user
    const cart = await cartModel.findOne({ _id: cartId, user: req.user.id });
    // To inspect the cart details
    console.log(cart);
    if (!cart) {
      return res
        .status(404)
        .send("No cart found for the user or cart ID mismatch");
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    console.log(cart.items);

    if (itemIndex > -1) {
      // Update the quantity
      cart.items[itemIndex].quantity = quantity;

      // Optional: Recalculate the total price based on updated quantity and item price
      cart.total_price = cart.items.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );

      await cart.save();
      return res.status(200).send("Cart item updated successfully");
    } else {
      return res.status(404).send("Item not found in the cart");
    }
  } catch (error) {
    console.error("Error updating cart item: ", error);
    return res.status(500).send("Error updating cart item");
  }
};

export const listCartbyId = async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.user?.id) {
      return res.status(401).json({
        status: false,
        message: "User must be logged in to view the cart",
      });
    }

    const cart = await cartModel
      .findOne({ user: req.user.id })
      .populate("items.product"); // Adjust the query based on your cart schema

    // Check if the cart exists
    if (cart == null || cart.items.length === 0) {
      return res.status(200).json({
        status: true,
        message: "Cart is empty",
        cart: null, // Optional: You can return `cart` as `null` if desired
      });
    }

    if (!cart) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    // Send the cart details as response
    return res.status(200).json({ status: true, cart });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

export const deleteCartItem = async (req, res) => {
  const { id, size, color } = req.body;

  try {
    // Ensure user is logged in
    if (!req.user?.id) {
      return res.status(401).json({
        status: false,
        message: "User must be logged in to delete a cart item",
      });
    }

    // Find the user's cart
    const cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    // Find the index of the item to delete based on product ID, size, and color
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === id
      // item.size === size &&
      // item.color === color
    );

    // Check if the product is in the cart
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Recalculate total price after removal
    cart.total_price = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Save updated cart
    await cart.save();

    return res
      .status(200)
      .json({
        status: true,
        message: "Item removed from cart successfully",
        cart,
      });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
