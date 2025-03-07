import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    company_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "vendor"],
      default: "vendor",
    },
    hashed_password: {
      type: String,
      required: true,
    },
    gstin:{
      type:String,
    },
    address: [
      {
        flatNo: {
          type: String,
          required: true,
        },
        area: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        pincode: {
          type: String,
          required: true,
        },
      },
    ],
    is_approved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // bank_account: {
    //     account_holder_name: { 
    //         type: String, 
    //         required: true 
    //     },
    //     bank_name: {
    //         type: String, 
    //         required: true 
    //     },
    //     account_number: { 
    //         type: String, 
    //         required: true 
    //     },
    //     ifsc_code: {
    //         type: String, 
    //         required: true 
    //     },
    //     branch_name: {
    //          type: String, 
    //          required: true 
    //     },
    //     city:{
    //       type:String,
    //       required:true
    //     },
    //     state:{
    //       type:String,
    //       required:true
    //     },
    //     account_type: {
    //         type: String,
    //         required: true,
    //     },
    // },
  },
  { timestamps: true }
);

export const vendorModel = mongoose.model("Vendors", vendorSchema);
