const mongoose=require("mongoose")

mongoose.set('strictQuery', false);
const { Schema } = mongoose;
const { ObjectId } = Schema;

const couponSchema=new mongoose.Schema({
    
    couponCode:{
        type:String,
        required:true,
    },
    
    couponName:{
        type:String,
        required:true,
    },
    discount:{
        type:Number,
        required:true,
      },
      startingDate:{
        type:Date,
        required:true,
      },
     expiryDate:{
        type:Date,
        required:true,
      },
      minAmount:{
        type:String,
        required:true,
      },
    unlist:{
        type:Boolean,
        default:false
    }
   

})

  //we need to create a collection
  const Coupon=new mongoose.model("Coupon",couponSchema);
    
   

  module.exports=Coupon