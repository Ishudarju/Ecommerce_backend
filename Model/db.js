import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env["MONGODB_URI"]);
    console.log("Ecommerce Database Connected Successfully");
  } catch (error) {
    console.log("Error While Connecting Database", error);
  }
};

export default connectDatabase;