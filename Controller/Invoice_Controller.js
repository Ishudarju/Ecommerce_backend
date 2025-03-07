import { invoiceModel } from "../models/invoiceModel.js";
import { productModel } from "../models/productModel.js";

export const createInvoice = async (req, res) => {
  try {
    const { user, products, discount, payment_status } = req.body;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "Products are required" });
    }

    let total_price = 0;
    let gst_total = 0;

    for (const item of products) {
      const product = await productModel.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          status: false,
          message: `Product not found: ${item.product_id}`,
        });
      }

      item.price = product.final_price; // Assuming final_price is stored in productModel
      item.total_price = item.quantity * item.price;
      item.gst_amount = (item.total_price * item.gst_percentage) / 100;
      total_price += item.total_price;
      gst_total += item.gst_amount;
    }

    const discountAmount = discount ? (total_price * discount) / 100 : 0;
    const final_price = total_price - discountAmount + gst_total;

    const newInvoice = new invoiceModel({
      invoice_number: `INV-${Date.now()}`,
      user: user || null,
      products,
      total_price,
      discount,
      gst_total,
      final_price,
      payment_status,
    });

    await newInvoice.save();
    res.status(201).json({
      status: true,
      message: "Invoice created successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await invoiceModel
      .find()
      .populate("user")
      .populate("products.product_id");
    res.status(200).json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceModel
      .findById(id)
      .populate("user")
      .populate("products.product_id");
    if (!invoice) {
      return res
        .status(404)
        .json({ status: false, message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.body;
    const updatedInvoice = await invoiceModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedInvoice) {
      return res
        .status(404)
        .json({ status: false, message: "Invoice not found" });
    }
    res.status(200).json({
      status: true,
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvoice = await invoiceModel.findByIdAndDelete(id);
    if (!deletedInvoice) {
      return res
        .status(404)
        .json({ status: false, message: "Invoice not found" });
    }
    res
      .status(200)
      .json({ status: true, message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getInvoiceByUser = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  try {
    const invoices = await invoiceModel
      .find({ user: user_id })
      .populate("user")
      .populate("products.product_id");

    if (invoices.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No invoices found for this user" });
    }

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res
      .status(500)
      .json({
        // success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};


