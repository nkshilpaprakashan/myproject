const mongoose=require("mongoose")

mongoose.set('strictQuery', false);

const groupSchema=new mongoose.Schema({
    groupId:{
        type:String,
        required:true
    },
    
    groupName:{
        type:String,
        required:true,
    }
        
})

  //we need to create a collection
  const Group=new mongoose.model("Group",groupSchema);
    
   

  module.exports=Group