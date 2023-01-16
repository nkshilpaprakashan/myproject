
const mongoose=require('mongoose')

/********************Connection setUp of mongoose Driver**************************/ 
function mongodb(){
    mongoose.connect('mongodb://127.0.0.1:27017/Myproject',{
        useNewUrlParser:true,
        useUnifiedTopology:true
        },(err)=>{
        if(err){
            console.log('Not Connected')
        }else{
            console.log('Connection Successful')
        }
    })
}

module.exports=mongodb
