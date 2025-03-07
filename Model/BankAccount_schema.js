import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendors",
      required: true,
    },
    account_holder_name: {
      type: String,
      required: true,
    },
    bank_name: {
      type: String,
      required: true,
    },
    account_number: {
      type: String,
      required: true,
    },
    ifsc_code: {
      type: String,
      required: true,
    },
    branch_name: {
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
    account_type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const bankAccountModel = mongoose.model(
  "BankAccount",
  bankAccountSchema
);
