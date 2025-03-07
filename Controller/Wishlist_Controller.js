import { WishlistModel } from "../Model/Wishlist_schema.js";
import { productModel } from "../Model/Product_schema.js";

export const addProductToWishlist = async (req, res) => {
  console.log(req.body);
  try {
    const { productId } = req.body;
    const { id } = req.user;

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if wishlist exists for the user
    let wishlist = await WishlistModel.findOne({ user_id: id });

    if (!wishlist) {
      // If wishlist doesn't exist, create a new one
      wishlist = new WishlistModel({
        user_id: id,
        name: `${id}'s Wishlist`,
        items: [productId],
      });
    } else {
      // Check if the product is already in the wishlist
      if (wishlist.items.includes(productId)) {
        return res
          .status(400)
          .json({ message: "Product already exists in the wishlist" });
      }
      
      // Add the product to the items array
      wishlist.items.push(productId);
    }

    await wishlist.save();
    return res
      .status(200)
      .json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};


// Get the user's wishlist
export const getUserWishlist = async (req, res) => {
  try {
    const { id:user_id } = req.user;

    // Find the wishlist for the user
    const wishlist = await WishlistModel.findOne({ user_id }).populate("items");

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    return res.status(200).json({ wishlist });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Remove a product from the wishlist
export const removeProductFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const { id: userId } = req.user; // Extract user ID from authenticated user

    // Find the user's wishlist
    const wishlist = await WishlistModel.findOne({ user_id: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Check if the product exists in the wishlist
    if (!wishlist.items.includes(productId)) {
      return res.status(400).json({ message: "Product not found in wishlist" });
    }

    // Remove the product from the wishlist
    wishlist.items = wishlist.items.filter(
      (item) => item.toString() !== productId
    );

    // Save the updated wishlist
    await wishlist.save();

    return res
      .status(200)
      .json({ message: "Product removed from wishlist", wishlist });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};


export const getWishlistById = async (req, res) => {

  try {
    const { productId } = req.body;
    const wishlist = await WishlistModel.findById(productId).populate("items");
    console.log(wishlist);
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    return res.status(200).json({ wishlist });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}


export const checkForWishlist = async (req, res) => {
  try {
    const { productId } = req.body; // Get product ID from request parameters
    const { id: userId } = req.user; // Extract user ID from authenticated user

    // Find the user's wishlist
    const wishlist = await WishlistModel.findOne({ user_id: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Check if the product exists in the wishlist
    const isProductInWishlist = wishlist.items.includes(productId);

    return res.status(200).json({
      message: isProductInWishlist
        ? "Product exists in wishlist"
        : "Product not found in wishlist",
      exists: isProductInWishlist,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
