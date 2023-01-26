const mongoose=require("mongoose")

mongoose.set('strictQuery', false);

const productSchema=new mongoose.Schema({
    
    item_code:{
        type:String,
        required:true,
        unique:true

    },
    item_name:{
        type:String,
        required:true
    },

    product_description:{
        type:String,
        
        
    },

    groupName:{
        type:String,
        required:true
        
    },
    categoryName:{
        type:String,
        required:true
        
    },
    size:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    mrp:{
        type:String,
        required:true
    },
    
    available_quantity:{
        type:Number,
        required:true
        
    },
    product_unit:{
        type:String,
        required:true
        
    },
   
    percentage_discount:{
        type:String,
        required:true
        
    },
    
    image:{
        type:Array,
        
    },
     unlist:{
        type:Boolean,
        default:false
    }
   

})

  //we need to create a collection
  const Product=new mongoose.model("Product",productSchema);
    
   

  module.exports=Product