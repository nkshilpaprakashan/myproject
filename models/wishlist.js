const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema;
const wishlistSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
            },
    productId: {
          type: ObjectId,
          required: true,
            },

  
    price: {
          type: Number,
          required: true,
        },
      
      })
const Wishlist = mongoose.model('wishlist', wishlistSchema);
module.exports = Wishlist;