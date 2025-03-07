import multer from "multer";
import fs from "fs";
import path from "path";
import { promisify } from "util";

import { productModel } from "../Model/Product_schema.js";
import { categoryModel } from "../Model/Categories_schema.js";
import { WishlistModel } from "../Model/Wishlist_schema.js";
// import { subcategoryModel } from "../Model/SubCategory_schema.js";

// Configure multer for handling multiple file uploads and renaming files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Assets/Products/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Default filename
  },
});

const upload = multer({ storage: storage }).array("images", 5);
const uploadFiles = promisify(upload);

// Function to handle file uploads
const handleFileUploads = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: false, message: "File upload error" });
    }
    next();
  });
};

// Function to check if the product exists
const checkProductExists = async (gender, size, color) => {
  return await productModel.findOne({
    "variants.gender": gender,
    "variants.size": size,
    // "variants.color": color,
    color,
  });
};

const generateProductId = async (categoryId, productName) => {
  // Step 1: Sanitize product name (trim and convert to uppercase/lowercase if needed)
  const sanitizedProductName = productName.trim(0, 3);

  // Step 2: Get the first three letters of the product name
  const firstThree = sanitizedProductName.toUpperCase();

  // Step 3: Count the number of products in the same category
  const countInCategory = await productModel.countDocuments({
    category_id: categoryId,
  });

  // Step 4: Fetch the category number (cat_no) from the category schema
  const category = await categoryModel.findById(categoryId);
  const categoryNumber = category.cat_no;

  // Step 5: Generate the new product ID
  const newProductId = `CAT0${categoryNumber}PAT0${countInCategory + 1}`;

  return newProductId;
};

const generateVariantId = (productId, size, color) => {
  // Generate variant ID using product ID and size
  return `${productId}-${size.toUpperCase()}-${color}`;
};
const generateProductDetailsId = (productId, size, color) => {
  // Generate variant ID using product ID and size
  return `${productId}-${size.toUpperCase()}-${color}`;
};
// export const createProduct = async (req, res) => {
//   console.log(req.user);
//   try {
//     // Authorization check
//     if (req.user.role !== "vendor") {
//       res.status(401).json({ error: "Unauthorized access" });
//       return;
//     }

//     // Handle file uploads with a promise
//     await new Promise((resolve, reject) => {
//       handleFileUploads(req, res, (err) => {
//         if (err) reject(err);
//         resolve();
//       });
//     });
//     console.log(req.body);
//     console.log(req.files);

//     // Extract and validate required fields from request body
//     const {
//       name,
//       description,
//       MRP,
//       selling_price,
//       gender,
//       offer_percentage,
//       color,
//       gst_percentage,
//       category,
//       sub_category,
//       variants,
//       product_details,
//       country_of_origin,
//       seller_details,
//     } = req.body;

//     if (!name || !description || !MRP || !category || !variants) {
//       return res
//         .status(400)
//         .json({ status: false, error: "Missing required fields" });
//     }

//     // Check if the product already exists based on name, gender, size, and color in variants
//     for (let variant of variants) {
//       const { gender, size, color } = variant;
//       const existingProduct = await checkProductExists(gender, size, color);
//       if (existingProduct) {
//         return res.status(400).json({
//           error: `Product with these specifications already exists:  (${gender}, ${size}, ${color})`,
//         });
//       }
//     }

//     // Process uploaded files and prepare for saving
//     const images = req.files.map((file) => {
//       const extension = path.extname(file.originalname);
//       const uniqueName = `product-${Date.now()}${extension}`;
//       const newPath = path.join("Assets/Products", uniqueName);
//       fs.renameSync(file.path, newPath);
//       return newPath;
//     });

//     // Generate a product ID
//     const productId = await generateProductId(category, name);
//     const UniqueVariants = variants.map((variant) => {
//       return {
//         variant_id: generateVariantId(productId, variant.size, color), // Generate variant ID using productId and size
//         ...variant,
//       };
//     });
//     const UniqueDetails = variants.map((variant, index) => {
//       return {
//         detail_id: generateProductDetailsId(productId, variant.size, color), // Generate unique ID
//         ...product_details[index], // Merge with corresponding product details
//       };
//     });
//     console.log(UniqueVariants);

//     const processedSellerDetails = {
//       name: seller_details[0]?.seller_name || "Unknown",
//       location: seller_details[0]?.seller_location || "Unknown",
//     };
//     const calculateGST = (selling_price, gst_Percentage, offer_percentage) => {
//       // Ensure MRP, GST percentage, and offer percentage are numbers
//       const MRPValue = parseFloat(selling_price);
//       const gstPercentageValue = parseFloat(gst_Percentage);
//       const offerPercentageValue = parseFloat(offer_percentage);

//       if (
//         isNaN(MRPValue) ||
//         isNaN(gstPercentageValue) ||
//         isNaN(offerPercentageValue)
//       ) {
//         throw new Error(
//           "MRP, GST percentage, and offer percentage must be valid numbers"
//         );
//       }

//       // Calculate discounted price
//       const discount_price = MRPValue - MRPValue * (offerPercentageValue / 100);

//       // Convert GST percentage to decimal
//       const gstDecimal = gstPercentageValue / 100;

//       // Calculate GST amount
//       const gstAmount = discount_price * gstDecimal;

//       // Calculate price with GST
//       const priceWithGST = discount_price + gstAmount;

//       // Calculate commission (2% of the discounted price)
//       const commission = discount_price * (2 / 100);

//       // Calculate final price by adding the commission to the price including GST
//       const finalPrice = priceWithGST + commission;

//       return {
//         gstAmount: gstAmount.toFixed(2), // GST amount rounded to 2 decimal places
//         priceWithGST: priceWithGST.toFixed(2), // Price including GST
//         finalPrice: finalPrice.toFixed(2), // Final price after adding commission
//       };
//     };

//     // Calculate total stock function
//     const calculateTotalStock = (variants) => {
//       if (!Array.isArray(variants)) {
//         throw new Error("Variants should be an array");
//       }

//       return variants.reduce((totalStock, variant) => {
//         const stockValue = parseInt(variant.stock, 10);

//         if (isNaN(stockValue)) {
//           throw new Error("Each variant should have a valid stock number");
//         }

//         return totalStock + stockValue;
//       }, 0); // Initial total stock is 0
//     };

//     const gstResult = calculateGST(MRP, gst_percentage, offer_percentage);
//     const totalStock = calculateTotalStock(UniqueVariants);
//     // Prepare new product data
//     const newProductData = {
//       product_id: productId,
//       name,
//       gender,
//       description,
//       MRP,
//       offer_percentage,
//       color:color.toLowerCase(),
//       gst_percentage,
//       price_with_gst: gstResult.priceWithGST,
//       final_price: gstResult.finalPrice,
//       category_id: category,
//       sub_category_id: sub_category,
//       vendor_id: req.user.id,
//       total_stock: totalStock,
//       variants: UniqueVariants,
//       product_details: UniqueDetails,
//       country_of_origin,
//       seller_details: processedSellerDetails,
//       images,
//     };

//     // Create a new product instance and save to database
//     const newProduct = new productModel(newProductData);
//     await newProduct.save();

//     // Indicate successful product creation
//     res.status(201).json({
//       data: {
//         message: "Product created successfully",
//         newProduct,
//       },
//     });
//   } catch (error) {
//     // Handle any errors that occur
//     console.error("Error in product creation:", error);
//     res
//       .status(500)
//       .json({ error: "Server error occurred while creating the product" });
//   }
// };

export const createProduct = async (req, res) => {
  console.log(req.user);
  try {
    // Authorization check
    if (req.user.role !== "vendor") {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    // Handle file uploads with a promise
    await new Promise((resolve, reject) => {
      handleFileUploads(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    console.log(req.body);
    console.log(req.files);

    // Extract and validate required fields from request body
    const {
      name,
      description,
      MRP,
      selling_price,
      gender,
      color,
      gst_percentage,
      gst,
      category,
      subCategory,
      variants,
      product_details,
      country_of_origin,
      seller_details,
      product_storeType,
    } = req.body;

    if (
      !name ||
      !description ||
      !MRP ||
      !selling_price ||
      !category ||
      !variants
    ) {
      return res
        .status(400)
        .json({ status: false, error: "Missing required fields" });
    }

    // Check if the product already exists based on name, gender, size, and color in variants
    for (let variant of variants) {
      const { gender, size, color } = variant;
      const existingProduct = await checkProductExists(gender, size, color);
      if (existingProduct) {
        return res.status(400).json({
          error: `Product with these specifications already exists: (${gender}, ${size}, ${color})`,
        });
      }
    }

    // Process uploaded files and prepare for saving
    const images = req.files.map((file) => {
      const extension = path.extname(file.originalname);
      const uniqueName = `product-${Date.now()}${extension}`;
      const newPath = path.join("Assets/Products", uniqueName);
      fs.renameSync(file.path, newPath);
      return newPath;
    });

    // Generate a product ID
    const productId = await generateProductId(category, name);

    // Generate unique variants and details
    const UniqueVariants = variants.map((variant) => ({
      variant_id: generateVariantId(productId, variant.size, variant.color),
      ...variant,
    }));

    const UniqueDetails = variants.map((variant, index) => ({
      detail_id: generateProductDetailsId(
        productId,
        variant.size,
        variant.color
      ),
      ...product_details[index],
    }));

    const processedSellerDetails = {
      name: seller_details[0]?.seller_name || "Unknown",
      location: seller_details[0]?.seller_location || "Unknown",
    };

    // Calculate GST, final price, and offer percentage
    const calculateGST = (MRP, selling_price, gst_Percentage) => {
      const MRPValue = parseFloat(MRP);
      const sellingPriceValue = parseFloat(selling_price);
      const gstPercentageValue = parseFloat(gst_Percentage);

      if (
        isNaN(MRPValue) ||
        isNaN(sellingPriceValue) ||
        isNaN(gstPercentageValue)
      ) {
        throw new Error(
          "MRP, selling price, and GST percentage must be valid numbers"
        );
      }

      // Calculate offer percentage from MRP and selling price
      // const offerPercentageValue =
      //   ((MRPValue - sellingPriceValue) / MRPValue) * 100;

      // Convert GST percentage to decimal
      const gstDecimal = gstPercentageValue / 100;

      // Calculate GST amount based on selling price
      const gstAmount = sellingPriceValue * gstDecimal;

      // Calculate price with GST
      const priceWithGST = sellingPriceValue + gstAmount;

      // Calculate commission (2% of the selling price)
      const commission = sellingPriceValue * (2 / 100);

      // Calculate final price by adding the commission to the price including GST
      const finalPrice = priceWithGST + commission;

      return {
        gstAmount: gstAmount.toFixed(2), // GST amount rounded to 2 decimal places
        priceWithGST: priceWithGST.toFixed(2), // Price including GST
        finalPrice: finalPrice.toFixed(2), // Final price after adding commission
        // offerPercentage: offerPercentageValue.toFixed(2), // Offer percentage
      };
    };

    // Calculate total stock function
    const calculateTotalStock = (variants) => {
      if (!Array.isArray(variants)) {
        throw new Error("Variants should be an array");
      }

      return variants.reduce((totalStock, variant) => {
        const stockValue = parseInt(variant.stock, 10);

        if (isNaN(stockValue)) {
          throw new Error("Each variant should have a valid stock number");
        }

        return totalStock + stockValue;
      }, 0); // Initial total stock is 0
    };

    const gstResult = calculateGST(MRP, selling_price, gst_percentage);
    const totalStock = calculateTotalStock(UniqueVariants);

    // Prepare new product data
    const newProductData = {
      product_id: productId,
      name,
      gender,
      description,
      MRP, // Retain MRP as is
      selling_price, // Include selling price
      offer_percentage: gstResult.offerPercentage, // Calculated dynamically
      // color: variants.map((variant) => variant.color?.toLowerCase()),
      color: color,
      gst_percentage,
      product_storeType: product_storeType || "online",
      price_with_gst: gstResult.priceWithGST,
      gst: gstResult.gstAmount,
      final_price: gstResult.finalPrice,
      category_id: category,
      sub_category_id: subCategory,
      vendor_id: req.user.id,
      total_stock: totalStock,
      variants: UniqueVariants,
      product_details: UniqueDetails,
      country_of_origin,
      seller_details: processedSellerDetails,
      images,
    };

    // Create a new product instance and save to database
    const newProduct = new productModel(newProductData);
    await newProduct.save();

    // Indicate successful product creation
    res.status(201).json({
      data: {
        message: "Product created successfully",
        newProduct,
      },
    });
  } catch (error) {
    // Handle any errors that occur
    console.error("Error in product creation:", error);
    res
      .status(500)
      .json({ error: "Server error occurred while creating the product" });
  }
};

// export const createProduct = async (req, res) => {
//   try {
//     // Authorization check
//     if (req.user.role !== "vendor") {
//       return res.status(401).json({ error: "Unauthorized access" });
//     }

//     // Handle file uploads
//     await new Promise((resolve, reject) => {
//       handleFileUploads(req, res, (err) => {
//         if (err) reject(err);
//         resolve();
//       });
//     });

//     // Log the request body and uploaded files for debugging
//     console.log("Request Body:", req.body);
//     console.log("Uploaded Files:", req.files);

//     // Extract and validate required fields from request body
//     const {
//       name,
//       description,
//       MRP,
//       selling_price,
//       gender,
//       gst_percentage,
//       category,
//       sub_category,
//       variants,
//       product_details,
//       country_of_origin,
//       seller_details,
//       product_storeType,
//     } = req.body;

//     if (!name || !description || !MRP || !selling_price || !category || !variants) {
//       return res.status(400).json({ status: false, error: "Missing required fields" });
//     }

//     // Check if the product already exists based on name, gender, size, and color in variants
//     for (let variant of variants) {
//       const { gender, size, color } = variant;
//       const existingProduct = await checkProductExists(gender, size, color);
//       if (existingProduct) {
//         return res.status(400).json({
//           error: `Product with these specifications already exists: (${gender}, ${size}, ${color})`,
//         });
//       }
//     }

//     // Ensure directory for storing files exists
//     const targetDir = path.join("Assets", "Products");
//     if (!fs.existsSync(targetDir)) {
//       fs.mkdirSync(targetDir, { recursive: true });
//     }

//     // Process uploaded files and prepare for saving
//     const images = req.files.map((file) => {
//       try {
//         const extension = path.extname(file.originalname);
//         const uniqueName = `product-${Date.now()}${extension}`;
//         const newPath = path.join(targetDir, uniqueName);
//         const sourcePath = file.path; // Path to the uploaded temporary file

//         // Check if the source file exists
//         if (!fs.existsSync(sourcePath)) {
//           throw new Error(`Source file not found: ${sourcePath}`);
//         }

//         // Move the file to the new path
//         fs.renameSync(sourcePath, newPath);
//         return newPath;
//       } catch (error) {
//         console.error("File processing error:", error);
//         throw new Error("Failed to process uploaded files.");
//       }
//     });

//     // Generate a product ID
//     const productId = await generateProductId(category, name);

//     // Generate unique variants and details
//     const UniqueVariants = variants.map((variant) => ({
//       variant_id: generateVariantId(productId, variant.size, variant.color),
//       ...variant,
//     }));

//     const UniqueDetails = variants.map((variant, index) => ({
//       detail_id: generateProductDetailsId(productId, variant.size, variant.color),
//       ...product_details[index],
//     }));

//     const processedSellerDetails = {
//       name: seller_details[0]?.seller_name || "Unknown",
//       location: seller_details[0]?.seller_location || "Unknown",
//     };

//     // Calculate GST, final price, and offer percentage
//     const calculateGST = (MRP, selling_price, gst_Percentage) => {
//       const MRPValue = parseFloat(MRP);
//       const sellingPriceValue = parseFloat(selling_price);
//       const gstPercentageValue = parseFloat(gst_Percentage);

//       if (isNaN(MRPValue) || isNaN(sellingPriceValue) || isNaN(gstPercentageValue)) {
//         throw new Error("MRP, selling price, and GST percentage must be valid numbers");
//       }

//       const offerPercentageValue = ((MRPValue - sellingPriceValue) / MRPValue) * 100;
//       const gstDecimal = gstPercentageValue / 100;
//       const gstAmount = sellingPriceValue * gstDecimal;
//       const priceWithGST = sellingPriceValue + gstAmount;
//       const commission = sellingPriceValue * (2 / 100);
//       const finalPrice = priceWithGST + commission;

//       return {
//         gstAmount: gstAmount.toFixed(2),
//         priceWithGST: priceWithGST.toFixed(2),
//         finalPrice: finalPrice.toFixed(2),
//         offerPercentage: offerPercentageValue.toFixed(2),
//       };
//     };

//     const calculateTotalStock = (variants) => {
//       if (!Array.isArray(variants)) {
//         throw new Error("Variants should be an array");
//       }
//       return variants.reduce((totalStock, variant) => {
//         const stockValue = parseInt(variant.stock, 10);
//         if (isNaN(stockValue)) {
//           throw new Error("Each variant should have a valid stock number");
//         }
//         return totalStock + stockValue;
//       }, 0);
//     };

//     const gstResult = calculateGST(MRP, selling_price, gst_percentage);
//     const totalStock = calculateTotalStock(UniqueVariants);

//     // Prepare new product data
//     const newProductData = {
//       product_id: productId,
//       name,
//       gender,
//       description,
//       MRP,
//       selling_price,
//       offer_percentage: gstResult.offerPercentage,
//       color: variants.map((variant) => variant.color.toLowerCase()),
//       gst_percentage,
//       product_storeType: product_storeType || "online",
//       price_with_gst: gstResult.priceWithGST,
//       final_price: gstResult.finalPrice,
//       category_id: category,
//       sub_category_id: sub_category,
//       vendor_id: req.user.id,
//       total_stock: totalStock,
//       variants: UniqueVariants,
//       product_details: UniqueDetails,
//       country_of_origin,
//       seller_details: processedSellerDetails,
//       images,
//     };

//     // Create a new product instance and save to database
//     const newProduct = new productModel(newProductData);
//     await newProduct.save();

//     // Indicate successful product creation
//     res.status(201).json({
//       data: {
//         message: "Product created successfully",
//         newProduct,
//       },
//     });
//   } catch (error) {
//     // Handle any errors that occur
//     console.error("Error in product creation:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const updateProduct = async (req, res) => {
//   try {
//     // Check user authorization

//     if (req.user.role !== "vendor") {
//       return res
//         .status(401)
//         .json({ status: false, error: "Unauthorized access" });
//     }

//     // Handle file uploads with a promise
//     await new Promise((resolve, reject) => {
//       handleFileUploads(req, res, (err) => {
//         if (err) return reject(err);
//         resolve();
//       });
//     });

//     // Extract and validate required fields from request body
//     const {
//       productId,
//       name,
//       gender,
//       description,
//       MRP,
//       offer_percentage,
//       color,
//       gst_percentage,
//       category,
//       variants,
//       product_details,
//       country_of_origin,
//       seller_details,
//     } = req.body;
//     console.log(req.body);
//     console.log(req.files);
//     // Check if product ID is provided
//     if (!productId) {
//       return res
//         .status(400)
//         .json({ status: false, error: "Product ID is required" });
//     }

//     // Validate required fields
//     if (!name || !description || !MRP || !category || !variants) {
//       return res
//         .status(400)
//         .json({ status: false, error: "Missing required fields" });
//     }
//     console.log(req.body);
//     // Find existing product by ID
//     const existingProduct = await productModel.findById(req.body.productId);
//     if (!existingProduct) {
//       return res
//         .status(404)
//         .json({ status: false, error: "Product not found" });
//     }

//     // Process and rename files if new ones are uploaded
//     let images = existingProduct.images;
//     if (req.files && req.files.length > 0) {
//       // Remove old images
//       existingProduct.images.forEach((imagePath) => {
//         fs.unlink(imagePath, (err) => {
//           if (err) console.error("Failed to remove old image:", err);
//         });
//       });

//       // Save new images
//       images = req.files.map((file) => {
//         const extension = path.extname(file.originalname);
//         const uniqueName = `product-${Date.now()}${extension}`;
//         const newPath = path.join("Assets/Products", uniqueName);
//         fs.renameSync(file.path, newPath);
//         return newPath;
//       });
//     }

//     // Update product details and variants
//     // const UniqueVariants = variants.map((variant) => {
//     //   return {
//     //     variant_id: generateVariantId(id, variant.size, color),
//     //     ...variant,
//     //   };
//     // });

//     // const UniqueDetails = variants.map((variant, index) => {
//     //   return {
//     //     detail_id: generateProductDetailsId(id, variant.size, color),
//     //     ...product_details[index],
//     //   };
//     // });

//     const processedSellerDetails = {
//       name:
//         seller_details[0]?.seller_name || existingProduct.seller_details.name,
//       location:
//         seller_details[0]?.seller_location ||
//         existingProduct.seller_details.location,
//     };

//     // Calculate GST and final price
//     const gstResult = calculateGST(MRP, gst_percentage);
//     const totalStock = calculateTotalStock(UniqueVariants);

//     // Prepare updated product data
//     const updateData = {
//       name,
//       gender,
//       description,
//       MRP,
//       offer_percentage,
//       color:color.toLowerCase(),
//       gst_percentage,
//       price_with_gst: gstResult.priceWithGST,
//       final_price: Math.floor(gstResult.finalPrice),
//       category_id: category,
//       total_stock: totalStock,
//       variants,
//       product_details,
//       country_of_origin,
//       seller_details: processedSellerDetails,
//       images,
//     };

//     // Update product in the database
//     const updatedProduct = await productModel.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedProduct) {
//       return res
//         .status(404)
//         .json({ status: false, error: "Product update failed" });
//     }

//     // Indicate successful product update
//     return res.status(200).json({
//       status: true,
//       message: "Product updated successfully",
//       data: updatedProduct,
//     });
//   } catch (error) {
//     // Handle any errors that occur
//     console.error("Error in product update:", error);
//     return res.status(500).json({
//       status: false,
//       error: "Server error occurred while updating the product",
//     });
//   }
// };

// export const updateProduct = async (req, res) => {
//   try {
//     // Check user authorization
//     if (req.user.role !== "vendor") {
//       return res
//         .status(401)
//         .json({ status: false, error: "Unauthorized access" });
//     }

//     // Handle file uploads with a promise
//     await new Promise((resolve, reject) => {
//       handleFileUploads(req, res, (err) => {
//         if (err) return reject(err);
//         resolve();
//       });
//     });

//     // Extract and validate required fields from request body
//     const {
//       productId,
//       name,
//       gender,
//       description,
//       selling_price,
//       MRP, // Using selling_price instead of MRP
//       offer_percentage,
//       color,
//       gst_percentage,
//       category,
//       variants,
//       product_details,
//       country_of_origin,
//       seller_details,
//     } = req.body;

//     console.log(req.body);
//     console.log(req.files);

//     // Check if product ID is provided
//     if (!productId) {
//       return res
//         .status(400)
//         .json({ status: false, error: "Product ID is required" });
//     }

//     // Validate required fields
//     if (!name || !description || !selling_price || !category || !variants) {
//       return res
//         .status(400)
//         .json({ status: false, error: "Missing required fields" });
//     }

//     // Find existing product by ID
//     const existingProduct = await productModel.findById(productId);
//     if (!existingProduct) {
//       return res
//         .status(404)
//         .json({ status: false, error: "Product not found" });
//     }

//     // Process and rename files if new ones are uploaded
//     let images = existingProduct.images;
//     if (req.files && req.files.length > 0) {
//       // Remove old images
//       existingProduct.images.forEach((imagePath) => {
//         fs.unlink(imagePath, (err) => {
//           if (err) console.error("Failed to remove old image:", err);
//         });
//       });

//       // Save new images
//       images = req.files.map((file) => {
//         const extension = path.extname(file.originalname);
//         const uniqueName = `product-${Date.now()}${extension}`;
//         const newPath = path.join("Assets/Products", uniqueName);
//         fs.renameSync(file.path, newPath);
//         return newPath;
//       });
//     }

//     // Process seller details
//     const processedSellerDetails = {
//       name:
//         seller_details[0]?.seller_name || existingProduct.seller_details.name,
//       location:
//         seller_details[0]?.seller_location ||
//         existingProduct.seller_details.location,
//     };

//     // GST calculation
//     const gstResult = calculateGST(
//       selling_price,
//       gst_percentage,
//       offer_percentage
//     );
//     const totalStock = calculateTotalStock(variants);

//     // Prepare updated product data
//     const updateData = {
//       name,
//       gender,
//       description,
//       MRP,
//       selling_price,
//       offer_percentage,
//       color: color.toLowerCase(),
//       gst_percentage,
//       price_with_gst: gstResult.priceWithGST,
//       final_price: Math.floor(gstResult.finalPrice),
//       category_id: category,
//       total_stock: totalStock,
//       variants,
//       product_details,
//       country_of_origin,
//       seller_details: processedSellerDetails,
//       images,
//     };

//     // Update product in the database
//     const updatedProduct = await productModel.findByIdAndUpdate(
//       productId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedProduct) {
//       return res
//         .status(404)
//         .json({ status: false, error: "Product update failed" });
//     }

//     // Indicate successful product update
//     return res.status(200).json({
//       status: true,
//       message: "Product updated successfully",
//       data: updatedProduct,
//     });
//   } catch (error) {
//     // Handle any errors that occur
//     console.error("Error in product update:", error);
//     return res.status(500).json({
//       status: false,
//       error: "Server error occurred while updating the product",
//     });
//   }
// };

export const updateProduct = async (req, res) => {
  try {
    // Authorization check
    if (req.user.role !== "vendor") {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Handle file uploads with a promise
    await new Promise((resolve, reject) => {
      handleFileUploads(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    const productId = req.params.id; // Product ID to update
    const {
      name,
      description,
      MRP,
      selling_price,
      gender,
      color,
      gst_percentage,
      category,
      subCategory,
      variants,
      product_details,
      country_of_origin,
      seller_details,
      product_storeType,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !MRP ||
      !selling_price ||
      !category ||
      !variants
    ) {
      return res
        .status(400)
        .json({ status: false, error: "Missing required fields" });
    }

    // Check if product exists
    const existingProduct = await productModel.findOne({
      product_id: productId,
      vendor_id: req.user.id,
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check for duplicate variants
    for (let variant of variants) {
      const { size, color: variantColor, gender: variantGender } = variant;
      const duplicateVariant = await productModel.findOne({
        "variants.size": size,
        "variants.color": variantColor,
        "variants.gender": variantGender,
        product_id: { $ne: productId },
      });

      if (duplicateVariant) {
        return res.status(400).json({
          error: `A product with these specifications already exists: (${variantGender}, ${size}, ${variantColor})`,
        });
      }
    }

    // Process uploaded files and update image paths
    let images = existingProduct.images;
    if (req.files.length > 0) {
      images = req.files.map((file) => {
        const extension = path.extname(file.originalname);
        const uniqueName = `product-${Date.now()}${extension}`;
        const newPath = path.join("Assets/Products", uniqueName);
        fs.renameSync(file.path, newPath);
        return newPath;
      });
    }

    // Calculate GST, final price, and total stock
    const calculateGST = (MRP, selling_price, gstPercentage) => {
      const sellingPriceValue = parseFloat(selling_price);
      const gstPercentageValue = parseFloat(gstPercentage);
      const gstAmount = sellingPriceValue * (gstPercentageValue / 100);
      const priceWithGST = sellingPriceValue + gstAmount;
      const commission = sellingPriceValue * 0.02;
      const finalPrice = priceWithGST + commission;

      return {
        gstAmount: gstAmount.toFixed(2),
        priceWithGST: priceWithGST.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
      };
    };

    const calculateTotalStock = (variants) => {
      return variants.reduce((totalStock, variant) => {
        const stockValue = parseInt(variant.stock, 10);
        if (isNaN(stockValue)) {
          throw new Error("Each variant must have a valid stock number.");
        }
        return totalStock + stockValue;
      }, 0);
    };

    const gstResult = calculateGST(MRP, selling_price, gst_percentage);
    const totalStock = calculateTotalStock(variants);

    // Generate updated variants and details
    const updatedVariants = variants.map((variant) => ({
      variant_id: generateVariantId(productId, variant.size, variant.color),
      ...variant,
    }));

    const updatedDetails = product_details.map((detail, index) => ({
      detail_id: generateProductDetailsId(
        productId,
        updatedVariants[index].size,
        updatedVariants[index].color
      ),
      ...detail,
    }));

    const updatedSellerDetails = {
      name:
        seller_details[0]?.seller_name || existingProduct.seller_details.name,
      location:
        seller_details[0]?.seller_location ||
        existingProduct.seller_details.location,
    };

    // Update product fields
    existingProduct.name = name;
    existingProduct.description = description;
    existingProduct.MRP = MRP;
    existingProduct.selling_price = selling_price;
    existingProduct.gender = gender;
    existingProduct.color = color;
    existingProduct.category_id = category;
    existingProduct.sub_category_id = subCategory;
    existingProduct.gst_percentage = gst_percentage;
    existingProduct.gst = gstResult.gstAmount;
    existingProduct.final_price = gstResult.finalPrice;
    existingProduct.price_with_gst = gstResult.priceWithGST;
    existingProduct.total_stock = totalStock;
    existingProduct.country_of_origin = country_of_origin;
    existingProduct.seller_details = updatedSellerDetails;
    existingProduct.product_storeType = product_storeType || "online";
    existingProduct.variants = updatedVariants;
    existingProduct.product_details = updatedDetails;
    existingProduct.images = images;

    // Save updated product
    await existingProduct.save();

    // Respond with success
    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct: existingProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ error: "Server error occurred while updating the product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // Check user authorization
    if (req.user.role !== "vendor") {
      return res
        .status(401)
        .json({ status: false, message: "No Authorization" });
    }

    // Get the product ID from the request body
    const { productId } = req.body;

    // Check if product ID is provided
    if (!productId) {
      return res
        .status(400)
        .json({ status: false, message: "Product ID is required" });
    }

    // Find the product by its ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    // Remove associated images from the file system
    if (product.images && product.images.length > 0) {
      product.images.forEach((imagePath) => {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete image:", err);
          }
        });
      });
    }

    // Delete the product from the database
    await productModel.findByIdAndDelete(productId);

    console.log("Product deleted successfully");
    return res
      .status(200)
      .json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await productModel
//       .find()
//       .populate("category_id")
//       .lean()
//       .exec();
//     res
//       .status(200)
//       .json({ products, message: "Products fetched successfully" });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching products", error: error.message });
//   }
// };

// export const filterProducts = async (req, res) => {
//   try {
//     const { color = [], categoryId = "", price = [], size = [] } = req.body;
//     console.log(req.body);
//     // console.log(req.params);

//     const filterConditions = {};

//     // Apply color filter
//     if (color.length > 0) {
//       const trimmedColors = color.filter(Boolean).map((item) => item.trim());
//       if (trimmedColors.length > 0) {
//         filterConditions.color = { $in: trimmedColors };
//       }
//     }

//     // Apply category filter
//     if (categoryId) {
//       filterConditions.category_id = categoryId.trim();
//     }

//     // Apply price filter (assumes price format is 'min - max')
//     if (price.length > 0) {
//       const [minPrice, maxPrice] = price[0].split(' - ').map((item) => parseInt(item, 10));
//       if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//         filterConditions.price = { $gte: minPrice, $lte: maxPrice };
//       }
//     }

//     // Apply size filter
//     if (size.length > 0) {
//       const trimmedSizes = size.filter(Boolean).map((item) => item.trim());
//       if (trimmedSizes.length > 0) {
//         filterConditions.size = { $in: trimmedSizes };
//       }
//     }

//     // Fetch products based on filter conditions and populate the category field
//     const products = await productModel.find(filterConditions);
//     console.log("Filter conditions:", filterConditions);

//     // Respond if no products are found
//     if (products.length === 0) {
//       return res.status(404).json({ message: "No products found matching the criteria." });
//     }

//     return res.status(200).json({ products });
//   } catch (error) {
//     console.error("Error filtering products:", error);
//     return res.status(500).json({ message: "Internal server error occurred while filtering products." });
//   }
// };
export const getAllProducts = async (req, res) => {
  try {
    const products = await productModel
      .find()
      .populate({
        path: "category_id", // Only include categories with storeType "online"
        select: "name storeType", // Include specific fields
      })
      .populate({
        path: "sub_category_id",
        select: "name", // Include only the subcategory name
      }); // Exclude deleted products;

    console.log("Fetched Products (Raw):", products); // Debugging log

    return res.status(200).json({
      products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};





// export const filterProducts = async (req, res) => {
//   try {
//     const { color = [], categoryId = "", price = [], size = [] } = req.body;
//     console.log(req.body);

//     const filterConditions = {};

//     // Apply color filter
//     if (color.length > 0) {
//       const trimmedColors = color.filter(Boolean).map((item) => item.trim());
//       if (trimmedColors.length > 0) {
//         filterConditions.color = { $in: trimmedColors };
//       }
//     }

//     // Apply category filter
//     if (categoryId) {
//       filterConditions.category_id = categoryId.trim();
//     }

//     // Apply price filter (assumes price format is 'min - max')
//     if (price.length > 0) {
//       const [minPrice, maxPrice] = price[0]
//         .split(" - ")
//         .map((item) => parseInt(item, 10));
//       if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//         filterConditions.price = { $gte: minPrice, $lte: maxPrice };
//       }
//     }

//     // Apply size filter (check within variants array)
//     if (size.length > 0) {
//       const trimmedSizes = size.filter(Boolean).map((item) => item.trim());
//       if (trimmedSizes.length > 0) {
//         filterConditions["variants.size"] = { $in: trimmedSizes }; // Filter within the variants array
//       }
//     }

//     // Fetch products based on filter conditions and populate the category field
//     const products = await productModel.find(filterConditions);
//     console.log("Filter conditions:", filterConditions);

//     // Respond if no products are found
//     if (products.length === 0) {
//       return res
//         .status(200)
//         .json({ message: "No products found matching the criteria." });
//     }

//     return res.status(200).json({ products });
//   } catch (error) {
//     console.error("Error filtering products:", error);
//     return res.status(500).json({
//       message: "Internal server error occurred while filtering products.",
//     });
//   }
// };

// Controller function for filtering products by price
// export const productByPrice = async (req, res) => {
//   try {
//     const { price } = req.body;
//     console.log(req.body);
//     if (price && price.length > 0) {
//       const [minPrice, maxPrice] = price
//         .split(" - ")
//         .map((item) => parseInt(item, 10));
//       if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//         const priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };

//         // Fetch products within the price range
//         const products = await productModel.find(priceFilter);

//         // Respond if no products are found
//         if (products.length === 0) {
//           return res.status(404).json({
//             message: "No products found in the specified price range.",
//           });
//         }

//         return res.status(200).json({ products });
//       }
//     }
//     return res.status(400).json({ message: "Invalid price range format." });
//   } catch (error) {
//     console.error("Error filtering products by price:", error);
//     return res.status(500).json({
//       message:
//         "Internal server error occurred while filtering products by price.",
//     });
//   }
// };

export const filterProducts = async (req, res) => {
  try {
    const { color = [], categoryId = "", price = [], size = [] } = req.body;
    console.log(req.body);

    const filterConditions = {};

    // Apply color filter
    if (color.length > 0) {
      const trimmedColors = color.filter(Boolean).map((item) => item.trim());
      if (trimmedColors.length > 0) {
        filterConditions.color = { $in: trimmedColors };
      }
    }

    // Apply category filter
    if (categoryId) {
      filterConditions.category_id = categoryId.trim();
    }

    // Apply price filter (assumes price format is 'min-max')
    if (price.length > 0) {
      const [minPrice, maxPrice] = price[0]
        .split("-")  // Split without spaces
        .map((item) => parseInt(item.trim(), 10));  // Trim spaces and parse to integers
      console.log(`Price filter: minPrice = ${minPrice}, maxPrice = ${maxPrice}`);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        filterConditions.price = { $gte: minPrice, $lte: maxPrice };
      }
    }

    // Apply size filter (check within variants array)
    if (size.length > 0) {
      const trimmedSizes = size.filter(Boolean).map((item) => item.trim());
      if (trimmedSizes.length > 0) {
        filterConditions["variants.size"] = { $in: trimmedSizes }; // Filter within the variants array
      }
    }

    console.log("Filter conditions:", filterConditions);

    // Fetch products based on filter conditions
    const products = await productModel.find(filterConditions);
    console.log("Fetched products:", products);

    // Respond if no products are found
    if (products.length === 0) {
      return res
        .status(200)
        .json({ message: "No products found matching the criteria." });
    }

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error filtering products:", error);
    return res.status(500).json({
      message: "Internal server error occurred while filtering products.",
    });
  }
};




export const productByPrice = async (req, res) => {
  try {
    const { price } = req.body;
    console.log(req.body);
    if (price && price.length > 0) {
      const [minPrice, maxPrice] = price
        .split("-")  // Split by a hyphen without spaces
        .map((item) => parseInt(item.trim(), 10));  // Trim any extra spaces and parse to integers
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        const priceFilter = { final_price: { $gte: minPrice, $lte: maxPrice } };

        // Fetch products within the price range
        const products = await productModel.find(priceFilter);

        // Respond if no products are found
        if (products.length === 0) {
          return res.status(404).json({
            message: "No products found in the specified price range.",
          });
        }

        return res.status(200).json({ products });
      }
    }
    return res.status(400).json({ message: "Invalid price range format." });
  } catch (error) {
    console.error("Error filtering products by price:", error);
    return res.status(500).json({
      message:
        "Internal server error occurred while filtering products by price.",
    });
  }
};

export const productByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    // Initialize an empty query object
    const query = {};

    // Apply category filter by finding the category by name
    if (category) {
      const categoryData = await categoryModel.findOne({ name: category });
      // console.log(categoryData);
      if (categoryData) {
        query.category_id = categoryData._id; // Use the ObjectId of the found category
      } else {
        // If no category found, return no products
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
    }
    const products = await productModel.find(query).populate("category_id");
    // console.log(products);
    // Return the filtered products
    return res.status(200).json({
      success: true,
      message: "Fetching product by Category",
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error. Unable to fetch products.",
    });
  }
};

export const ProductByGender = async (req, res) => {
  try {
    // Get the gender from query parameters
    const { gender } = req.query;
    // console.log(req);
    // Check if the gender parameter is provided and valid
    if (!gender || !["men", "women", "kids"].includes(gender.toLowerCase())) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid gender parameter" });
    }

    // Query products by gender
    const products = await productModel.find({ gender: gender.toLowerCase() });
    console.log(products);
    return res.status(200).json({ status: true, products });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal Server error", error });
  }
};

export const getProductById = async (req, res) => {
  console.log(req.query);
  try {
    const { productId } = req.query;
    if (!productId) {
      return res
        .status(400)
        .json({ status: false, message: "Product ID is required" });
    }

    const product = await productModel
      .findById(productId)
      .populate("category_id","name")
      .populate("sub_category_id","name")
      .populate("vendor_id","name email");
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server error. Unable to fetch product.",
    });
  }
};

export const getProductByColor = async (req, res) => {
  try {
    const { color } = req.query;
    if (!color) {
      return res
        .status(400)
        .json({ status: false, message: "Color is required" });
    }

    const products = await productModel.find({
      color: color.toLowerCase(),
      is_deleted: false,
    });
    if (products.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No products found with the specified color",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server error. Unable to fetch products.",
    });
  }
};

export const getColorsForSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ status: false, message: "Product ID is required" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    const similarProducts = await productModel
      .find({
        name: product.name,
        _id: { $ne: productId },
      })
      .select("color _id");

    const colors = similarProducts.map((p) => ({ id: p._id, colors: p.color }));

    return res.status(200).json({
      status: true,
      message: "Colors for similar products fetched successfully",
      colors,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message:
        "Internal Server error. Unable to fetch colors for similar products.",
    });
  }
};

export const getRecentProducts = async (req, res) => {
  try {
    const products = await productModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10);
    res
      .status(200)
      .json({ products, message: "Recent products fetched successfully" });
  } catch (error) {
    console.error("Error fetching recent products:", error);
    res.status(500).json({
      message: "Error fetching recent products",
      error: error.message,
    });
  }
};


export const latestProducts = async (req, res) => {

  try {
    const products = await productModel.find().sort({ createdAt: -1 }).limit(10);
    console.log(products);
    res.status(200).json({ products, message: "Latest products fetched successfully" });
  } catch (error) {
    console.error("Error fetching latest products:", error);
    res.status(500).json({ message: "Error fetching latest products", error: error.message });
  }

}