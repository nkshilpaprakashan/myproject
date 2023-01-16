const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema;
const cartSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
            },
    productId: {
          type: ObjectId,
          required: true,
            },

    quantity: {
          type: Number,
          required: true,
        },
    price: {
          type: Number,
          required: true,
        },
    amount: {
          type: Number,
          required: true,
        }, 
    couponcode:{
      type:String,
    } ,
    discount:{
      default:0,
      type:Number,
    } 

      
      
      })

 
  
  
  


const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;