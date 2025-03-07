import { vendorModel } from "../Model/Vendor_schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { productModel } from "../Model/Product_schema.js";
import { orderModel } from "../Model/Order_schema.js";

export const authMiddleware = (req, res, next) => {
  const token = req?.headers["authorization"]
    ? req?.headers["authorization"]
    : "";
  if (!token) {
    return res
      .status(200)
      .json({ status: false, message: "Token not provided" });
  }
  // token = token.split(" ")[1];

  jwt.verify(token, "Evvi_Solutions_Private_Limited", (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(200)
          .json({ status: false, statusCode: 700, message: "Token expired" });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "Invalid token" });
      }
    }

    req.user = decoded;
    next();
  });
};
export const registerVendor = async (req, res) => {
  try {
    const { name, email, companyname, phone_number, password, gstin, address } =
      req.body;
    console.log(req.body);
    const existingVendor = await vendorModel.findOne({ email });
    if (existingVendor) {
      return res
        .status(400)
        .json({ message: "Vendor with this email already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    // const bank_account = vendorBankDetails(bankDetails);
    const vendor_address = addressDetails(address);
    // console.log(bank_account);
    const newVendor = new vendorModel({
      name,
      email,
      company_name: companyname,
      phone_number,
      hashed_password,
      gstin: gstin ? gstin : "",
      address: vendor_address, // Attach bank details separately
    });
    await newVendor.save();

    return res.status(201).json({
      status: true,
      message: "Vendor registered successfully Wait for Admin to Verify",
      vendor: {
        id: newVendor?._id,
        name: newVendor?.name,
        email: newVendor?.email,
        company_name: newVendor?.company_name,
        phone_number: newVendor?.phone_number,
        address: newVendor?.address,
        gstin: newVendor?.gstin,
      },
    });
  } catch (error) {
    console.log(error); // Log the error for debugging
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter required fields" });
    }

    // Find the vendor by email
    const existingVendor = await vendorModel.findOne({ email });
    if (!existingVendor) {
      return res
        .status(404)
        .json({ status: false, message: "Vendor not found" });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(
      password,
      existingVendor.hashed_password
    );
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid password" });
    }
    if (!existingVendor._id || !existingVendor.email || !existingVendor.role) {
      return res
        .status(404)
        .json({ status: false, message: "Vendor data is incomplete" });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: existingVendor._id,
        email: existingVendor.email,
        role: existingVendor.role,
      },
      process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
      { expiresIn: "5h" }
    );

    // Update the vendor's status to 'true' if currently 'false'
    if (existingVendor.is_approved === false) {
      return res.status(400).json({
        status: false,
        message: "Be Patient for Admin Approval and Notify through Mail",
      }); // Save the updated status
    }

    // Respond with the token and vendor details
    return res
      .status(200)
      .header("auth-token", token)
      .json({
        status: true,
        message: "Login successful",
        token,
        vendor: {
          id: existingVendor._id,
          email: existingVendor.email,
          name: existingVendor.name,
          status: existingVendor.status, // Vendor's updated status
        },
      });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  if (req.user.role === "vendor") {
    try {
      // Assuming the vendor's ID is stored in `req.user.id` after authentication
      const vendorId = req.user.id;

      // Find the vendor by ID, excluding the password field
      const vendor = await vendorModel
        .findById(vendorId)
        .select("-hashed_password");

      // Check if the vendor exists
      if (!vendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      // Return the vendor profile details
      return res.status(200).json({
        status: true,
        message: "Vendor profile retrieved successfully",
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          company_name: vendor.company_name,
          phone_number: vendor.phone_number,
          address: vendor.address,
          is_approved: vendor.is_approved,
          status: vendor.status,
          bank_account: vendor.bank_account, // Assuming bank details are stored here
        },
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Server error", error: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const getAllVendors = async (req, res) => {
  if (req.user.role === "admin") {
    // Assuming only admins can get all vendors
    try {
      // Fetch all vendors excluding the hashed password field
      const vendors = await vendorModel.find().select("-hashed_password");

      if (!vendors || vendors.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: "No vendors found" });
      }

      // Return the list of vendors
      return res.status(200).json({
        status: true,
        message: "Vendors retrieved successfully",
        vendors: vendors.map((vendor) => ({
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          company_name: vendor.company_name,
          phone_number: vendor.phone_number,
          address: vendor.address,
          is_approved: vendor.is_approved,
          status: vendor.status, // Bank details can be included if necessary
        })),
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Internal Server error" });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const deleteVendor = async (req, res) => {
  if (req.user.role === "admin") {
    // Assuming only admins can change vendor status
    try {
      const { vendorId } = req.params; // Assuming vendorId is passed as a URL parameter

      // Check if vendor ID is provided
      if (!vendorId) {
        return res
          .status(400)
          .json({ status: false, message: "Vendor ID is required" });
      }

      // Find the vendor and update the status to 'inactive'
      const updatedVendor = await vendorModel
        .findByIdAndUpdate(
          vendorId,
          { status: "inactive" },
          { new: true } // Return the updated vendor
        )
        .select("-hashed_password"); // Exclude hashed_password

      if (!updatedVendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      // Return success response
      return res.status(200).json({
        status: true,
        message: "Vendor status set to inactive",
        vendor: updatedVendor,
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      return res
        .status(500)
        .json({ status: false, message: "Server error", error: error.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};
// Example vendorBankDetails function

const addressDetails = (addresses) => {
  // Validate that addresses is an array and has at least one address object
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error("No addresses provided");
  }

  return addresses.map(({ flatNo, area, city, state, pincode }) => {
    // Validate each address object
    if (!flatNo || !area || !city || !state || !pincode) {
      throw new Error("Incomplete address details");
    }

    // Format the address according to your schema
    return {
      flatNo: flatNo,
      area: area,
      city: city,
      state: state,
      pincode: pincode,
      createdAt: new Date(), // Add a timestamp if needed
    };
  });
};

export const approveVendor = async (req, res) => {
  if (req.user.role == "admin") {
    try {
      const { vendorId, status } = req.body;
      console.log(req.body);
      if (!vendorId) {
        return res
          .status(401)
          .json({ status: false, message: "Vendor ID Required" });
      }

      const approvedVendor = await vendorModel.findByIdAndUpdate(
        vendorId, // This is the ID of the document to update
        { is_approved: status }, // This is the update object
        { new: true } // Optional: returns the updated document
      );

      if (!approvedVendor) {
        return res
          .status(404)
          .json({ status: false, message: "Vendor not found" });
      }

      return res
        .status(200)
        .json({ status: true, message: "Vendor Approved Successfully" });
      
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: "Internal Server Error", error: err.message });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};


export const countProductByVendor = async (req, res) => {
  if (req.user.role == "admin") {
    try {
      const { vendorId } = req.body;
      if (!vendorId) {
        return res
          .status(401)
          .json({ status: false, message: "Vendor ID required" });
      }
      await productModel
        .findById({ vendorId: vendorId })
        .then((vendorProductList) => {
          return res.status(200).json({
            status: true,
            message: "product count fetched Successfully",
            count: vendorProductList.length,
          });
        });
    } catch {
      return res
        .status(404)
        .json({ status: false, message: "no product Found" });
    }
  } else {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized access" });
  }
};

export const bulkApproveVendors = async (req, res) => {
  try {
    const { vendorIds } = req.body; // Array of vendor IDs to be approved

    // Update the is_approved and status for all vendors in the array
    const result = await vendorModel.updateMany(
      { _id: { $in: vendorIds } },
      { $set: { is_approved: true, status: "active" } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "No vendors found to approve." });
    }

    return res
      .status(200)
      .json({ message: `${result.nModified} vendors approved successfully.` });
  } catch (error) {
    console.error("Error approving vendors:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
const vendorBankDetails = (bank_account, vendorID) => {
  // Destructure properties from the bankAccount object
  const [
    {
      accountHolderName,
      accountNumber,
      accountType,
      ifscCode,
      bankName,
      branchName,
      city,
      state,
    },
  ] = bank_account;
  // console.log(
  //   accountHolderName,
  //   accountNumber,
  //   accountType,
  //   ifscCode,
  //   bankName,
  //   branchName,
  //   city,
  //   state
  // );
  // Validate bank account details
  if (
    !accountHolderName ||
    !bankName ||
    !accountNumber ||
    !ifscCode ||
    !branchName ||
    !city ||
    !state ||
    !accountType ||
    !vendorID
  ) {
    throw new Error("Incomplete bank account details or Vendor Id Requried");
  }

  // Format the bank details according to your schema
  return {
    vendorId: vendorID,
    account_holder_name: accountHolderName,
    bank_name: bankName,
    account_number: accountNumber,
    ifsc_code: ifscCode,
    branch_name: branchName,
    city: city,
    state: state,
    account_type: accountType,
    createdAt: new Date(), // Add a timestamp if needed
  };
};

export const createBankAccount = async (req, res) => {
  try {
    // Format the bank account details using the vendorBankDetails function
    const formattedBankDetails = vendorBankDetails(req.body, vendorId);

    // Create a new bank account instance
    const newBankAccount = new bankAccountModel(formattedBankDetails);

    // Save the bank account to the database
    await newBankAccount.save().then(() => {
      return res
        .status(201)
        .json({ status: true, message: "Bank Details Submitted Successfully" });
    });

    // Return the saved bank account
  } catch (error) {
    console.error("Error creating bank account:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to create bank account" });
    throw new Error("Failed to create bank account");
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ vendor_id: req.user.id })
      .populate("category_id", "name")
      .populate("sub_category_id","name")
      .populate("vendor_id","name email") // Populate the category name from Category model
      .exec();

    return res
      .status(200)
      .json({ status: true, message: "Product details", products });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Error fetching products", error });
  }
};


export const vendor_dashboard = async (req, res) => {
  try {
    const vendorId = req.user.id; // Assuming vendor authentication provides `req.user`
    console.log(vendorId);
    // Count total products added by the vendor
    const productCount = await productModel.countDocuments({
      vendor_id: vendorId
    });
    console.log(productCount);  
    // Count orders containing products added by the vendor
    const orderCount = await orderModel.countDocuments({
      "items.vendor_id": vendorId,
    });
    console.log(orderCount);
    // Calculate total sales amount for vendor's products
    const totalSales = await orderModel.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendor_id": vendorId } },
      { $group: { _id: null, total: { $sum: "$items.price" } } },
    ]);
    console.log(totalSales);
    // Count out-of-stock products by the vendor
    const outOfStockCount = await productModel.countDocuments({
      vendor_id: vendorId,
      stock: 0,
    });

    return res.status(200).json({
      status: true,
      data: {
        productCount,
        orderCount,
        totalSales: totalSales[0]?.total || 0,
        outOfStockCount,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};
