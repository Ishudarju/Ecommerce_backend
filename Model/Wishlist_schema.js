import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Assuming there is a User model
      required: true,
    },
    name: {
      type: String,
      required: true, // Name of the wishlist, typically user's name + "Wishlist"
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',  // Reference to Product Model
        required: true,
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

export const WishlistModel = mongoose.model('Wishlist', wishlistSchema);


