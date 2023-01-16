const mongoose=require("mongoose")

mongoose.set('strictQuery', false);

const categorySchema=new mongoose.Schema({
    
    groupName:{
        type:String,
        required:true,
    },
    
    categoryName:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:true
      },
    unlist:{
        type:Boolean,
        default:false
    }

})

  //we need to create a collection
  const Category=new mongoose.model("Category",categorySchema);
    
   

  module.exports=Category