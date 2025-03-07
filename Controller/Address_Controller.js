import { addressModel } from "../Model/Address_schema.js";

export const addAddress = async (req, res) => {
  console.log(req.user);
  if (req.user.role == "customer") {
    try {
      const {
        name,
        street,
        area,
        city,
        state,
        postalCode: pin,
        country,
        phone,
        isDefault,
      } = req.body;
      console.log(req.body);
      if (isDefault) {
        await addressModel.updateMany(
          { userId: req.user._id },
          { isDefault: false }
        );
      }

      const newAddress = new addressModel({
        userId: req.user.id,
        name,
        street,
        area,
        city,
        state,
        postalCode: pin,
        country,
        phone,
        isDefault,
      });

      await newAddress.save();
      console.log("jhjhdjd");
      return res.status(201).json({
        success: true,
        message: "Address added successfully",
        address: newAddress,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can add addresses",
    });
  }
};

export const updateAddress = async (req, res) => {
  if (req.user.role === "customer") {
    try {
      const {
        _id,
        userId,
        street,
        area,
        city,
        state,
        pin,
        country,
        isDefault,
      } = req.body;

      console.log(req.body);
      const existingAddress = await addressModel.findOne({
        _id: _id,
        userId: userId,
      });

      if (existingAddress) {
        existingAddress.street = street || existingAddress.street;
        existingAddress.area = area || existingAddress.area;
        existingAddress.city = city || existingAddress.city;
        existingAddress.state = state || existingAddress.state;
        existingAddress.postalCode = pin || existingAddress.postalCode;
        existingAddress.country = country || existingAddress.country;
        existingAddress.isDefault =
          isDefault !== undefined ? isDefault : existingAddress.isDefault;

        if (isDefault) {
          await addressModel.updateMany(
            { userId: req.user.id },
            { isDefault: false }
          );
          existingAddress.isDefault = true;
        }

        await existingAddress.save();
        return res.status(200).json({
          success: true,
          message: "Address updated successfully",
          address: existingAddress,
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can update their addresses",
    });
  }
};

export const deleteAddress = async (req, res) => {
  if (req.user.role === "customer") {
    try {
      const { addressId } = req.body;
      console.log(req.body);
      console.log(req.params);
      const result = await addressModel.deleteOne({
        _id: addressId,
        userId: req.user.id,
      });

      if (result.deletedCount > 0) {
        return res
          .status(200)
          .json({ success: true, message: "Address deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can delete their addresses",
    });
  }
};

export const getAddressesByUserId = async (req, res) => {
  if (req.user.role == "customer") {
    try {
      const addresses = await addressModel.find({ userId: req.user.id });

      if (addresses.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Addresses retrieved successfully",
          addresses,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No addresses found for this user",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only customers can view their addresses",
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  const { addressId } = req.body;
  const userId = req.user.id; // Assumes `userId` is available in `req.user` from authentication middleware

  try {
    // Set `isDefault` to false for all addresses of this user
    await addressModel.updateMany({ userId }, { isDefault: false });

    // Set `isDefault` to true for the specified address
    const updatedAddress = await addressModel.findByIdAndUpdate(
      addressId,
      { isDefault: true },
      { new: true }
    );

    // If the address was not found, return a 404 error
    if (!updatedAddress) {
      return res.status(404).json({ error: "Address not found." });
    }

    return res.status(200).json({
      message: "Address set as default successfully.",
      address: updatedAddress,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to set address as default." });
  }
};
