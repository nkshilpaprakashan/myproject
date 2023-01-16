const express=require('express')
const app=express()
const sessions=require('express-session')
var path = require('path');
const userRouter=require('./routes/users')
const adminRouter=require('./routes/index')
const morgan = require('morgan')


const mongodb=require('./config/mongooseConnection')
mongodb()//involked the imported function fron mongooseConnection.




/*---------------------------Setups-----------------------------*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));//to get the data from the user
app.use(morgan('dev'))
app.use(sessions({//setup session
    resave:true,//to resave the session
    saveUninitialized:true,
    secret:'khfihuifgyscghi6543367567vhbjjfgt45475nvjhgjgj+6+9878', //random hash key string to genarate session id     
}))

app.use((req, res, next) => {//setup cache
    res.set("Cache-Control", "no-store");
    next();
});

app.set('view engine','ejs')//setting up  view engine



app.listen(3000,()=>console.log('Server started'))


app.use('/public', express.static(__dirname + '/public'));
console.log(path.join(__dirname,'./views/layout'))

app.use('/',userRouter) //enable the user router
app.use('/',adminRouter)//enable the admin router

