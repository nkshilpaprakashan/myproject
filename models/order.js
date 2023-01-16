const mongoose = require('mongoose');

const {Schema} = mongoose;
const {ObjectId} = Schema;
const orderSchema = new Schema({

    orderNo: {
        type: Number,
        required: true
    },
    orderDate: {
        type: String,
        required: true
    },
    userId: {
        type: ObjectId,
        required: true
    },
    paymode: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    totalAmount: {
        type: Number,
        default: false
    },
    couponCode:{
        type:String
    },
    discount:{
       type:Number
    },


    products: [
        {
            productId: {
                type: ObjectId,
                required: true
            },

            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            amount: {
                type: Number,
                required: true
            }

        }
    ]
   


})


const Order = mongoose.model('order', orderSchema);
module.exports = Order;
