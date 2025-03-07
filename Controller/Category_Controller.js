import multer from "multer";
import fs from "fs";
import path from "path";

import { categoryModel } from "../Model/Categories_schema.js";
// import  * as SubCategory from "./SubCategory_Controller.js";
import { subCategoryModel } from "../Model/SubCategory_schema.js";
// export const createCategory = async (req, res) => {
//   if (req.user.role == "admin") {
//     const { name ,storeType,SubCategories} = req.body;
//     const image = req.file ? req.file.path : null;

//     if (!name || !image) {
//       return res
//         .status(400)
//         .json({ message: "Please Enter the Required Fields including image" });
//     }

//     const existingCategory = await categoryModel.findOne({
//       name: name,
//       storeType: storeType,
//       is_deleted: false,
//     });
//     if (existingCategory) {
//       return res.status(200).json({
//         status: false,
//         message: "Category with this name already exists.",
//       });
//     }

//     const categoryData = { name, image };
//     const newCategory = new categoryModel(categoryData);
//     await newCategory.save();

//     return res
//       .status(200)
//       .json({ status: true, message: "Category created successfully" });
//   } else {
//     return res.status(401).json({ status: false, message: "No Authorization" });
//   }
// };
export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ status: false, message: "No Authorization" });
    }

    const { name, storeType,subCategories } = req.body;
    const image = req.file ? req.file.path : null;
    console.log(req.body);
    // Validate required fields
    if (!name || !storeType || !image || !subCategories) {
      return res.status(400).json({
        status: false,
        message:
          "Please provide all required fields: name, storeType, SubCategories, and image.",
      });
    }

    // Check if the category already exists
    const existingCategory = await categoryModel.findOne({
      name,
      is_deleted: false,
    });

    if (existingCategory) {
      return res.status(200).json({
        status: false,
        message: "Category with this name already exists.",
      });
    }

    // Parse SubCategories into an array
    const subCategoryArray = subCategories.split(",").map((sub) => sub.trim());
    console.log("huhjhjhj",subCategoryArray);
    // Save the main category
    const newCategory = new categoryModel({
      name,
      storeType: storeType || "online",
      image,
    });
    const savedCategory = await newCategory.save();

    // Save the subcategories linked to the category
    const subCategoryDocs = subCategoryArray.map((subCategoryName) => ({
      name: subCategoryName,
      category_id: savedCategory._id,
    }));
    console.log(subCategoryDocs);
    await subCategoryModel.insertMany(subCategoryDocs);

    return res.status(200).json({
      status: true,
      message: "Category and Subcategories created successfully.",
    });
  } catch (error) {
    console.error("Error creating category and subcategories:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};
// export const updateCategory = async (req, res) => {
//   console.log(req.body);
//   console.log(req.file);

//   if (req.user.role === "admin") {
//     const { categoryId, name, storeType } = req.body;
//     const newImage = req.file ? req.file.path : null;

//     if (!categoryId || !name) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Please enter Required Fields" });
//     }

//     try {
//       // Find the category to check for the existing image
//       const category = await categoryModel.findById(categoryId);
//       if (!category) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Category not found" });
//       }

//       // Delete the old image if a new one is uploaded
//       if (newImage && category.image) {
//         const oldImagePath = path.join(process.cwd(), category.image);
//         try {
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath); // Delete the old image
//           }
//         } catch (unlinkError) {
//           return res.status(500).json({
//             success: false,
//             message: "Error deleting old image",
//             error: unlinkError.message,
//           });
//         }
//       }

//       // Update the category with the new data and image (if provided)
//       const updateData = { name };
//       if (newImage) {
//         updateData.image = newImage;
//       } else {
//         updateData.image = category.image; // Keep the old image if no new one is uploaded
//       }

//       const updatedCategory = await categoryModel.findByIdAndUpdate(
//         categoryId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       return res.status(200).json({
//         success: true,
//         message: "Category updated successfully",
//         data: updatedCategory,
//       });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({
//           success: false,
//           message: "Internal Server Error",
//           error: error.message,
//         });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ success: false, message: "Unauthorized Access" });
//   }
// };

// export const updateCategory = async (req, res) => {
//   console.log(req.body);
//   console.log(req.file);

//   if (req.user.role === "admin") {
//     const { categoryId, name, storeType, subCategories } = req.body;
//     const newImage = req.file ? req.file.path : null;

//     if (!categoryId || !name) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Please enter Required Fields" });
//     }

//     try {
//       // Find the category to check for the existing image
//       const category = await categoryModel.findById(categoryId);
//       if (!category) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Category not found" });
//       }

//       // Delete the old image if a new one is uploaded
//       if (newImage && category.image) {
//         const oldImagePath = path.join(process.cwd(), category.image);
//         try {
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath); // Delete the old image
//           }
//         } catch (unlinkError) {
//           return res.status(500).json({
//             success: false,
//             message: "Error deleting old image",
//             error: unlinkError.message,
//           });
//         }
//       }

//       // Update the category data (name, storeType, and image)
//       const updateData = { name, storeType };
//       if (newImage) {
//         updateData.image = newImage;
//       } else {
//         updateData.image = category.image; // Keep the old image if no new one is uploaded
//       }

//       const updatedCategory = await categoryModel.findByIdAndUpdate(
//         categoryId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       // Now, update the subcategories if provided
//       if (subCategories) {
//         // Parse SubCategories into an array
//         const subCategoryArray = subCategories.split(",").map((sub) =>
//           sub.trim()
//         );

//         // Update existing subcategories
//         await Promise.all(
//           subCategoryArray.map(async (subCategoryName) => {
//             // Check if the subcategory exists
//             const existingSubCategory = await subCategoryModel.findOne({
//               name: subCategoryName,
//               category_id: categoryId,
//             });
//             if (existingSubCategory) {
//               // Update existing subcategory
//               await subCategoryModel.findByIdAndUpdate(
//                 existingSubCategory._id,
//                 { name: subCategoryName }
//               );
//             } else {
//               // If subcategory doesn't exist, create a new one
//               await subCategoryModel.create({
//                 name: subCategoryName,
//                 category_id: categoryId,
//               });
//             }
//           })
//         );
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Category and Subcategories updated successfully",
//         data: updatedCategory,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal Server Error",
//         error: error.message,
//       });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ success: false, message: "Unauthorized Access" });
//   }
// };

// export const updateCategory = async (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
//   console.log(req.files);

//   if (req.user.role === "admin") {
//     const { categoryId, name, storeType, subCategories } = req.body;
//     const newImage = req.file ? req.file.path : null;

//     if (!categoryId || !name) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Please enter Required Fields" });
//     }
//     console.log(req.file);
//     console.log(req.body);
//     try {
//       // Find the category to check for the existing image
//       const category = await categoryModel.findById(categoryId);
//       if (!category) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Category not found" });
//       }

//       // Delete the old image if a new one is uploaded
//       if (newImage && category.image) {
//         const oldImagePath = path.join(process.cwd(), category.image);
//         try {
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath); // Delete the old image
//           }
//         } catch (unlinkError) {
//           return res.status(500).json({
//             success: false,
//             message: "Error deleting old image",
//             error: unlinkError.message,
//           });
//         }
//       }

//       // Update the category data (name, storeType, and image)
//       const updateData = { name, storeType };
//       if (newImage) {
//         updateData.image = newImage;
//       } else {
//         updateData.image = category.image; // Keep the old image if no new one is uploaded
//       }

//       const updatedCategory = await categoryModel.findByIdAndUpdate(
//         categoryId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       // Now, update the subcategories if provided
//       if (subCategories) {
//         // Parse SubCategories into an array
//         const subCategoryArray = subCategories.split(",").map((sub) => sub.trim());

//         // Fetch all existing subcategories for the category
//         const existingSubCategories = await subCategoryModel.find({
//           category_id: categoryId,
//         });

//         // Prepare lists for existing and new subcategories
//         const existingNames = existingSubCategories.map((sub) => sub.name);
//         const newNames = subCategoryArray.filter((name) => !existingNames.includes(name));
//         const toRemoveNames = existingNames.filter((name) => !subCategoryArray.includes(name));

//         // Update or delete existing subcategories
//         await Promise.all(
//           existingSubCategories.map(async (existingSubCategory) => {
//             if (subCategoryArray.includes(existingSubCategory.name)) {
//               // If the subcategory is in the new list, update it
//               await subCategoryModel.findByIdAndUpdate(existingSubCategory._id, {
//                 name: existingSubCategory.name,
//               });
//             } else if (toRemoveNames.includes(existingSubCategory.name)) {
//               // If the subcategory is not in the new list, remove it
//               await subCategoryModel.findByIdAndDelete(existingSubCategory._id);
//             }
//           })
//         );

//         // Add new subcategories
//         await Promise.all(
//           newNames.map(async (newSubCategoryName) => {
//             await subCategoryModel.create({
//               name: newSubCategoryName,
//               category_id: categoryId,
//             });
//           })
//         );
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Category and Subcategories updated successfully",
//         data: updatedCategory,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal Server Error",
//         error: error.message,
//       });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ success: false, message: "Unauthorized Access" });
//   }
// };




// export const updateCategory = async (req, res) => {
//   console.log(req.body);
//   console.log(req.file);

//   if (req.user.role === "admin") {
//     const { categoryId, name, storeType, subCategories } = req.body;
//     const newImage = req.file ? req.file.path : null;

//     if (!categoryId || !name) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Please enter required fields" });
//     }

//     try {
//       // Find the category to check for the existing image
//       const category = await categoryModel.findById(categoryId);
//       if (!category) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Category not found" });
//       }

//       // Delete the old image if a new one is uploaded
//       if (newImage && category.image) {
//         const oldImagePath = path.join(process.cwd(), category.image);
//         try {
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath); // Delete the old image
//           }
//         } catch (unlinkError) {
//           return res.status(500).json({
//             success: false,
//             message: "Error deleting old image",
//             error: unlinkError.message,
//           });
//         }
//       }

//       // Update the category data (name, storeType, and image)
//       const updateData = { name, storeType };
//       if (newImage) {
//         updateData.image = newImage;
//       } else {
//         updateData.image = category.image; // Keep the old image if no new one is uploaded
//       }

//       const updatedCategory = await categoryModel.findByIdAndUpdate(
//         categoryId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       // Now, update the subcategories if provided
//       if (subCategories) {
//         // Parse subCategories as a JSON array
//         const subCategoryArray = JSON.parse(subCategories);

//         // Fetch all existing subcategories for the category
//         const existingSubCategories = await subCategoryModel.find({
//           category_id: categoryId,
//         });

//         // Prepare lists for existing and new subcategories
//         const existingIds = existingSubCategories.map((sub) => sub._id.toString());
//         const updatedIds = subCategoryArray
//           .filter((sub) => sub._id)
//           .map((sub) => sub._id);

//         // Find subcategories to be removed
//         const toRemoveIds = existingIds.filter((id) => !updatedIds.includes(id));

//         // Remove subcategories that are no longer in the updated list
//         await Promise.all(
//           toRemoveIds.map(async (id) => {
//             await subCategoryModel.findByIdAndDelete(id);
//           })
//         );

//         // Update existing subcategories and add new ones
//         await Promise.all(
//           subCategoryArray.map(async (subCategory) => {
//             if (subCategory._id) {
//               // Update existing subcategory
//               await subCategoryModel.findByIdAndUpdate(
//                 subCategory._id,
//                 { name: subCategory.name },
//                 { new: true, runValidators: true }
//               );
//             } else {
//               // Add new subcategory
//               await subCategoryModel.create({
//                 name: subCategory.name,
//                 category_id: categoryId,
//               });
//             }
//           })
//         );
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Category and Subcategories updated successfully",
//         data: updatedCategory,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal Server Error",
//         error: error.message,
//       });
//     }
//   } else {
//     return res
//       .status(403)
//       .json({ success: false, message: "Unauthorized Access" });
//   }
// };

export const updateCategory = async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  if (req.user.role === "admin") {
    const { categoryId, name, storeType, subCategories } = req.body;
    const newImage = req.file ? req.file.path : null;

    if (!categoryId || !name) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter required fields" });
    }

    try {
      // Find the category to check for the existing image
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      // Delete the old image if a new one is uploaded
      if (newImage && category.image) {
        const oldImagePath = path.join(process.cwd(), category.image);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath); // Delete the old image
          }
        } catch (unlinkError) {
          return res.status(500).json({
            success: false,
            message: "Error deleting old image",
            error: unlinkError.message,
          });
        }
      }

      // Update the category data (name, storeType, and image)
      const updateData = { name, storeType };
      if (newImage) {
        updateData.image = newImage;
      } else {
        updateData.image = category.image; // Keep the old image if no new one is uploaded
      }

      const updatedCategory = await categoryModel.findByIdAndUpdate(
        categoryId,
        updateData,
        { new: true, runValidators: true }
      );

      // Now, update the subcategories if provided
      if (subCategories) {
        // Parse subCategories as a JSON array
        const subCategoryArray = JSON.parse(subCategories);

        // Fetch all existing subcategories for the category
        const existingSubCategories = await subCategoryModel.find({
          category_id: categoryId,
        });

        // Prepare lists for existing and new subcategories
        const existingIds = existingSubCategories.map((sub) => sub._id.toString());
        const updatedIds = subCategoryArray
          .filter((sub) => sub._id)
          .map((sub) => sub._id);

        // Find subcategories to be removed
        const toRemoveIds = existingIds.filter((id) => !updatedIds.includes(id));

        // Remove subcategories that are no longer in the updated list
        await Promise.all(
          toRemoveIds.map(async (id) => {
            await subCategoryModel.findByIdAndDelete(id);
          })
        );

        // Update existing subcategories and add new ones
        await Promise.all(
          subCategoryArray.map(async (subCategory) => {
            if (subCategory._id) {
              // Update existing subcategory
              await subCategoryModel.findByIdAndUpdate(
                subCategory._id,
                { name: subCategory.name },
                { new: true, runValidators: true }
              );
            } else {
              // Add new subcategory
              await subCategoryModel.create({
                name: subCategory.name,
                category_id: categoryId,
              });
            }
          })
        );
      }

      return res.status(200).json({
        success: true,
        message: "Category and Subcategories updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized Access" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const { id } = req.body;
      console.log(req.body);
      // Check if category ID is provided
      if (!id) {
        return res.status(400).json({
          status: false,
          message: "Category ID is required",
        });
      }

      // Find the category by its ID
      const category = await categoryModel.findById(id);
      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      // Delete the associated image if it exists
      if (category.image) {
        const imagePath = path.join(process.cwd(), category.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the image file
        }
      }

      // Delete the category from the database (hard delete)
      await categoryModel.findByIdAndUpdate(
        id,
        { is_deleted: true },
        { new: true }
      );
      console.log("Category and image deleted successfully");
      return res.status(200).json({
        status: true,
        message: "Category and image deleted successfully",
      });
    } else {
      return res
        .status(401)
        .json({ status: false, message: "No Authorization" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// export const getAllCategories = async (req, res) => {
//   try {
//     console.log("Fetching categories");
//     const categories = await categoryModel.find({ is_deleted: false }).populate{("subcategories","name _id")};
//     console.log(categories);
//     return res.status(200).json({
//       success: true,
//       message: "Categories fetched successfully",
//       data: categories,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, message: " Internel Server Error: " });
//   }
// };

// export const getAllCategories = async (req, res) => {
//   try {
//     const categories = await categoryModel.aggregate([
//       // Match categories that are not deleted
//       { $match: { is_deleted: false } },

//       // Lookup to join with the subcategories collection
//       {
//         $lookup: {
//           from: "subcategories", // The name of the collection to join (should match the model name)
//           localField: "_id", // The field from the Categories collection
//           foreignField: "category_id", // The field from the SubCategories collection
//           as: "subcategories", // Alias for the populated field
//         },
//       },

//       // Project the desired fields (you can modify this if needed)
//       {
//         $project: {
//           name: 1,
//           cat_no: 1,
//           storeType: 1,
//           image: 1,
//           subcategories: { name: 1, _id: 1 }, // Only include name and _id from subcategories
//         },
//       },
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Categories fetched successfully",
//       data: categories,
//     });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };




export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.aggregate([
      // Match categories that are not deleted
      { $match: { is_deleted: false } },

      // Lookup to join with the subcategories collection
      {
        $lookup: {
          from: "subcategories", // The name of the subcategories collection
          localField: "_id", // The field from the Categories collection
          foreignField: "category_id", // The field from the SubCategories collection
          as: "subcategories", // Alias for the populated field
        },
      },

      // Lookup to join the subcategories with the products collection to calculate product count
      {
        $lookup: {
          from: "products", // The name of the products collection
          localField: "subcategories._id", // The field from the SubCategories collection
          foreignField: "sub_category_id", // The field from the Products collection
          as: "subcategory_products", // Alias for the joined products
        },
      },

      // Add product count to each subcategory
      {
        $addFields: {
          subcategories: {
            $map: {
              input: "$subcategories",
              as: "subcategory",
              in: {
                _id: "$$subcategory._id",
                name: "$$subcategory.name",
                product_count: {
                  $size: {
                    $filter: {
                      input: "$subcategory_products",
                      as: "product",
                      cond: { $eq: ["$$product.sub_category_id", "$$subcategory._id"] },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // Project the desired fields
      {
        $project: {
          name: 1,
          cat_no: 1,
          storeType: 1,
          image: 1,
          subcategories: 1, // Include the modified subcategories with product count
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getCategoryById = async (req, res) => {  


    const { id } = req.body;
    const categories = await categoryModel.aggregate([
      // Match categories that are not deleted
      { $match: { is_deleted: false } },

      // Lookup to join with the subcategories collection
      {
        $lookup: {
          from: "subcategories", // The name of the collection to join (should match the model name)
          localField: "_id", // The field from the Categories collection
          foreignField: "category_id", // The field from the SubCategories collection
          as: "subcategories", // Alias for the populated field
        },
      },

      // Project the desired fields (you can modify this if needed)
      {
        $project: {
          name: 1,
          cat_no: 1,
          storeType: 1,
          image: 1,
          subcategories: { name: 1, _id: 1 }, // Only include name and _id from subcategories
        },
      },
    ]);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
}


