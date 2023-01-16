const mongoose=require("mongoose")

mongoose.set('strictQuery', false);

const userSchema=new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    phonenumber:{
        type:String,
        required:true
    },
    alternative_phonenumber:{
        type:String,
        required:true
    },
    houseno:{
        type:String,
        required:true
    },
    area:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    profileImage:{
        type: String
    },
    coupondata:[{
        coupon:String
    }]
   

    




})

  //we need to create a collection
  const Register=new mongoose.model("UserCollection",userSchema);
    
   

  module.exports=Register
