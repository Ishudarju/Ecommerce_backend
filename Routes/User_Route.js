import express from "express";
import * as User from "../Controller/User_Controller.js";
import * as Product from "../Controller/Product_Controller.js";
import * as Cart from "../Controller/Cart_Controller.js";
import * as Category from "../Controller/Category_Controller.js";
import * as Address from "../Controller/Address_Controller.js";
import * as Order from "../Controller/Order_Controller.js";
import * as Wish from "../Controller/Wishlist_Controller.js"
import * as Review from "../Controller/Review_Controller.js";

const UserRoute = express.Router();
// user
UserRoute.post("/login", User.userLogin);
UserRoute.post("/mobileLogin", User.mobileLogin);
UserRoute.post("/verifyOtp", User.verifyOTPAndLogin);
UserRoute.post("/register", User.registerUser);
// UserRoute.get("/getUserById",User.authMiddleware,User.getUserById);
UserRoute.put("/updateUser",User.authMiddleware,User.updateUser)

// address
UserRoute.post("/addAddress",User.authMiddleware,Address.addAddress)
UserRoute.put("/updateAddress",User.authMiddleware,Address.updateAddress);
UserRoute.delete("/deleteAddress",User.authMiddleware,Address.deleteAddress);
UserRoute.get("/getAddressesByUser",User.authMiddleware,Address.getAddressesByUserId);
UserRoute.put("/setDefault",User.authMiddleware,Address.setDefaultAddress);
UserRoute.post("/getUserById",User.authMiddleware,User.getUserById);

// cart
UserRoute.post("/createCart",User.authMiddleware, Cart.createCart);
UserRoute.post("/updateCart",Cart.authMiddleware,Cart.updateCartItem)
UserRoute.post("/deleteCart",Cart.authMiddleware,Cart.deleteCartItem)
UserRoute.get("/listCartById",Cart.authMiddleware,Cart.listCartbyId)


// products
UserRoute.post("/productList", Product.getAllProducts);
UserRoute.get("/getAllProducts", Product.getAllProducts);
UserRoute.post("/filterProducts", Product.filterProducts);
UserRoute.get("/getAllCategory", Category.getAllCategories);
UserRoute.get("/productByCategory", Product.productByCategory);
UserRoute.post("/productByPrice",Product.productByPrice)
UserRoute.get("/latestProducts",Product.latestProducts)
UserRoute.get("/productByGender",Product.ProductByGender);
UserRoute.get("/getProductById", Product.getProductById);
UserRoute.post("/similarProductsByColor", Product.getColorsForSimilarProducts);
UserRoute.get("/getrecentProducts", Product.getRecentProducts);

// WishList

UserRoute.post("/createWishlist",User.authMiddleware,Wish.addProductToWishlist)
UserRoute.get("/getWishlist",User.authMiddleware,Wish.getUserWishlist)
UserRoute.post("/removeWishlistItem",User.authMiddleware,Wish.removeProductFromWishlist)
UserRoute.get("/checkWishlist",User.authMiddleware,Wish.checkForWishlist)

// orders
UserRoute.post("/createOrder",User.authMiddleware,Order.createOrder);
UserRoute.get("/order/:id", User.authMiddleware, Order.getOrderById);
UserRoute.get("/orders", User.authMiddleware, Order.getAllOrders);
// UserRoute.put("/order/:id/status", User.authMiddleware, Order.updateOrderStatus);
UserRoute.delete("/order/:id", User.authMiddleware, Order.deleteOrder);
UserRoute.post("/getOrdersByUser", User.authMiddleware, Order.getOrdersByUser);
// UserRoute.post("/verifyPayment", User.authMiddleware, Order.verifyRazorpayPayment);

// reviews
UserRoute.post("/createReview", User.authMiddleware,Review.createReview);
UserRoute.get("/getAllReviews", Review.getAllReviews);
UserRoute.get("/getReviewById", Review.getReviewById);
UserRoute.put("/updateReviewById",User.authMiddleware, Review.updateReviewById);
UserRoute.delete("/deleteReviewById",User.authMiddleware, Review.deleteReviewById);
export default UserRoute;
