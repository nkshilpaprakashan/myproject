const userCollection = require('../models/userRegister')

const Product = require('../models/products')

const Coupon = require('../models/coupon')

const Category = require('../models/category')

const Cart = require('../models/cart')

const Wishlist = require('../models/wishlist')

const Order = require('../models/order')

const nodemailer = require('nodemailer')

var objectId = require('mongodb').ObjectId

const pdf = require('pdf-creator-node')

const paypal = require('paypal-rest-sdk')

const fs = require('fs')

const path = require('path')
const {log} = require('console')


paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': 'AfzUx05hJOwvK78h1XxgcVe6F4PZj5wFaL7u1CvXlXoFnAVoFclA30zjohv0gdGfptfqWVcm9rQKfCmz',
    'client_secret': 'EAlNNHvwkItYBJw6MVvRGzme8fVlKNGzdDy8jLI4jRKXR88uSoVNPyfUrM4tc8Cfhi746cYaDzeo3QO0'
});


// get
function userhome(req, res) {
 
    res.render('./user/partials/userhome', {sessionData: req.session.useranything})
}


// get
function userLogin(req, res) {
    
    if (req.session.useranything) {
        res.redirect('/')
    } else {

        res.render('./user/partials/userlogin', {wrong: req.session.validationpassword});
        req.session.destroy()
    }
}




// post
async function homeuserValidation(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

        console.log(`${email} and password is ${password}`)

        const userdata = await userCollection.findOne({email: email})
        // res.send(userdata)
        console.log(userdata)

        if (userdata.password === password) {
            if (userdata.isBlocked === false) {
                req.session.useranything = req.body.email
                console.log(userdata.isBlocked)
                res.redirect('/')
            } else {
                res.render('./user/partials/userlogin', {
                    wrong: "",
                    wrong2: "You have been blocked from accessing this website"
                })
            }

        } else {
            req.session.validationpassword = true
            res.redirect('/userlogin')
            // res.send("password incorrect ");
        }
    } catch (error) {
        req.session.validationpassword = true
        res.redirect('/userlogin')
       
        // res.status(400).send("Invalid login details");
    }
}


// get
function userSignup(req, res) {
    res.render('./user/partials/userregistration')
}

function userRegister(req, res) {
    res.render('./user/partials/userregistration')
}
let otpgen
let userData
async function userRegistered(req, res) {


    if (req.body.password == req.body.confirmpassword) { // otpgenerate
        otpgen = Math.floor(1000 + Math.random() * 9000)

        console.log(otpgen);

        // email
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mynodejsemail@gmail.com',
                pass: 'pficplfcfugqrrux' // password from gmail
            }
        });

        var mailOptions = {
            from: 'mynodejsemail@gmail.com',
            to: req.body.email, // doseje1135@bitvoo.com
            subject: 'YOUR OTP',
            // text: `enterotp`
            html: `<p>${otpgen}</p>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })


        userData = {

            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phonenumber: req.body.phonenumber,
            alternative_phonenumber: req.body.alternative_phonenumber,
            houseno: req.body.houseno,
            area: req.body.area,
            pincode: req.body.pincode,
            place: req.body.place,
            state: req.body.state,
            country: req.body.country,
            email: req.body.email,
            password: req.body.password,
            confirmpassword: req.body.confirmpassword
        }
        setTimeout(() => {
            otpgen = Math.floor(1000 + Math.random() * 9000)
            console.log("OTP Expired");
        }, 60000)
        res.render('./user/partials/otp')
    } else {
        res.render('./user/partials/userregistration', {
            check: "* Password are not matching *",
            check2: "*This mail already exist*"
        })
    }
}

async function otpValidation(req, res) {

    if (otpgen == req.body.otp) {
        await userCollection.insertMany([{
                first_name: userData.first_name,
                last_name: userData.last_name,
                phonenumber: userData.phonenumber,
                alternative_phonenumber: userData.alternative_phonenumber,
                houseno: userData.houseno,
                area: userData.area,
                pincode: userData.pincode,
                place: userData.place,
                state: userData.state,
                country: userData.country,
                email: userData.email,
                password: userData.password,
                confirmpassword: userData.confirmpassword
            }])
        res.redirect('/userlogin')
    }
}


async function forgotPassword(req, res) {

    const userdata = await userCollection.findOne({email: req.params.emailid})
    if (! userdata) {

        res.render('./user/partials/userlogin', {message: "Invalid email"})
        return


    }


    "hello"
    let upassword = userdata.password
    let uname = userdata.first_name
    let transporter = nodemailer.createTransport({
        service: 'gmail',


        auth: {
            user: 'mynodejsemail@gmail.com',
            pass: 'pficplfcfugqrrux' // generated ethereal password
        }

    });

    // setup email data with unicode symbols
    let details = {
        from: 'Mermaid', // sender address
        to: req.params.emailid, // list of receivers
        subject: 'Forgot Password', // Subject line

        html: `
             Hi dear ${uname}
             Have you forgotten your Password!? Don't worry...We are here to help you.<br>
             
             Here is your Password :<b> ${upassword} </b><br>
            
             
             Have a Nice day <br>
             
             Team Mermaid
             `
        // html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(details, (error, info) => {
        if (error) {
            return console.log(error);
        } else {

            res.render('./user/partials/userlogin', {
                msg: 'Email has been sent',
                wrong: ""
            });
        }
    });
}


async function getCategory(req, res) {

    let grpname = req.query.groupname
    let categorydata = await Category.find({groupName: req.query.groupname})
    let productdata = await Product.find({groupName: req.query.groupname})
    res.render('./user/partials/userProducts', {
        sessionData: req.session.useranything,
        productdata: productdata,
        categorydata,
        grpname
    })

}


async function getSelectCategory(req, res) {

    let categorydata = await Category.find({groupName: req.query.groupname})
    let grpname = req.query.groupname

    if (req.query.categoryName == 'ALL') {
        const productnewdata = await Product.find({groupName: req.query.groupname})
        res.render('./user/partials/userProducts', {
            sessionData: req.session.useranything,
            productdata: productnewdata,
            categorydata,
            grpname
        })
    } else {
        const productnewdata = await Product.find({
            $and: [
                {
                    categoryName: req.query.categoryName
                }, {
                    groupName: req.query.groupname
                }
            ]
        })
        res.render('./user/partials/userProducts', {
            sessionData: req.session.useranything,
            productdata: productnewdata,
            categorydata,
            grpname
        })
    }

}


async function getProduct(req, res) {
    let productid = req.query.id

    let productdata = await Product.findOne({_id: productid})
    res.render('./user/partials/productDetails', {
        sessionData: req.session.useranything,
        productdata: productdata
    })
}

async function productSearch(req, res) {

    let searchresult = req.params.searchtext
    console.log("search:" + searchresult);
    let productdata = await Product.find({
        $or: [
            {
                item_name: {
                    $regex: new RegExp(searchresult),
                    $options: 'i'
                }
            }, {
                categoryName: {
                    $regex: new RegExp(searchresult),
                    $options: 'i'
                }
            }
        ]
    })
    // let productdata=await Product.find({})
    let grpname = productdata.groupName
    let categorydata = await Category.find({groupName: grpname})

    res.render('./user/partials/userProducts', {
        sessionData: req.session.useranything,
        productdata: productdata,
        categorydata,
        grpname
    })


}


async function getAddtoCart(req, res) {
    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})

        let cartdata = await Cart.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productinfo"
                }
            }, {
                $unwind: "$productinfo"
            }

        ])


        res.render('./user/partials/addtoCart', {
            cartdata: cartdata,
            sessionData: req.session.useranything
        })


    } else {
        res.redirect('/userlogin')
    }
}


async function postAddtoCart(req, res) {
    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})

        let quantity = parseInt(req.body.quantity)

        let productid = req.query.id

        let productdata = await Product.findOne({_id: productid})

        const coupondata = await Coupon.find()

        // ---------------------------------


        let checkdata = await Cart.findOne({
            $and: [
                {
                    userId: objectId(userdata._id),
                    productId: productdata._id
                }
            ]
        })
        if (checkdata) {
            let amt = productdata.price

            await Cart.updateOne({
                userId: objectId(checkdata.userId)
            }, {
                $inc: {
                    quantity: 1,
                    amount: amt
                }
            })

        } else {
            await Cart.create({
                userId: objectId(userdata._id),
                productId: productid,
                quantity: quantity,
                price: productdata.price,
                amount: quantity * productdata.price,
                coupondata

            })

        }


        // ----------------------------------------
        let cartdata = await Cart.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productinfo"
                }
            }, {
                $unwind: "$productinfo"
            }

        ])


        console.log("records:" + cartdata.length)


        // res.render('./user/partials/addtoCart', {
        //     sessionData: req.session.useranything,
        //     productdata: productdata,
        //     userdata: userdata,
        //     cartdata: cartdata,
        //     quantity: quantity
        // })

        res.redirect('/')
    } else {
        res.redirect('/userlogin')
    }
}


async function removeFromCart(req, res) {


    req.session.delete = req.params.id
    await Cart.deleteOne({
        _id: objectId(req.session.delete)
    })
    console.log("shilpashilu")

    let useremail = req.session.useranything
    let userdata = await userCollection.findOne({email: useremail})

    let cartdata = await Cart.aggregate([
        {
            $match: {
                userId: objectId(userdata._id)
            }
        }, {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productinfo"
            }
        }, {
            $unwind: "$productinfo"
        }

    ])

    // res.redirect(307,'/categories/selectproduct/addtocart')
    res.render('./user/partials/addtoCart', {cartdata, sessionData: req.session.useranything})
}


async function getMakePayment(req, res) {
    if (req.session.useranything) {

        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})



        let cartdata = await Cart.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productinfo"
                }
            }, {
                $unwind: "$productinfo"
            }

        ])

        if(cartdata.discount!=""){

        }


        res.render('./user/partials/orderplace', {cartdata, userdata, sessionData: req.session.useranything});
    } else {

        res.redirect('/')
        req.session.destroy()
    }
}


async function editorder(req, res) {
    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})

        let cartdata = await Cart.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productinfo"
                }
            }, {
                $unwind: "$productinfo"
            }

        ])
        res.render('./user/partials/addtoCart', {
            sessionData: req.session.useranything,
            cartdata
        })
    } else {

        res.redirect('/');

    }
}


async function getOrderView(req, res) {

    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})

        console.log("userdata::" + userdata);

        let orderdata = await Order.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productinfo"
                }
            }, {
                $unwind: "$productinfo"
            }

        ])

        console.log("order" + orderdata)


        res.render('./user/partials/orderview', {
            orderdata: orderdata,
            sessionData: req.session.useranything,
            userdata
        })


    } else {
        res.redirect('/userlogin')
    }

}


async function myProfile(req, res) {

    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})
        console.log("shilu:" + useremail)
        console.log("shilpa:" + userdata)


        res.render('./user/partials/myprofile', {
            userdata: userdata,
            sessionData: req.session.useranything
        })


    } else {
        res.redirect('/userlogin')
    }

}


async function changePassword(req, res) {

    if (req.session.useranything) {
        res.render('./user/partials/changepassword', {sessionData: req.session.useranything})

    } else {
        res.redirect('/userlogin')
    }
}


async function postPasswordChanged(req, res) {

    let useremail = req.session.useranything

    let userdata = await userCollection.findOne({email: useremail})


    if (userdata.password === req.body.password) {
        if (req.body.newpassword == req.body.confirmpassword) {


            if (req.session.useranything) {
                let useremail = req.session.useranything


                await userCollection.updateOne({
                    email: useremail
                }, {
                    $set: {
                        password: req.body.newpassword
                    }
                })


                res.redirect('/myprofile')


            } else {
                res.redirect('/userlogin')
            }
        } else {
            res.render('./user/partials/changepassword', {
                check2: "* New Password and Confirm Password is not matching *",
                userdata,sessionData: req.session.useranything
            })

        }

    } else {
        res.render('./user/partials/changepassword', {
            check: "* Password is not matching your current password *",
            userdata,sessionData: req.session.useranything
        })
    }
}


async function changeAddress(req, res) {

    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})
        res.render('./user/partials/changeaddress', {
            sessionData: req.session.useranything,
            userdata
        })

    } else {
        res.redirect('/userlogin')
    }
}


async function postAddressChanged(req, res) {

    let useremail = req.session.useranything

    await userCollection.findOne({email: useremail})

    await userCollection.updateMany({
        email: useremail
    }, {
        $set: {


            houseno: req.body.houseno,
            area: req.body.area,
            pincode: req.body.pincode,
            place: req.body.place,
            state: req.body.state,
            country: req.body.country

        }
    })

    // res.render('./user/partials/myprofile',{userdata})
    res.redirect('/myprofile')

}


async function addAddress(req, res) {

    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})
        res.render('./user/partials/addAddress', {
            sessionData: req.session.useranything,
            userdata
        })

    } else {
        res.redirect('/userlogin')
    }
}

async function saveProfilePic(req, res) {

    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})

        await userCollection.updateOne({
            email: useremail
        }, {
            $set: {
                profileImage: req.query.filename
            }
        })
        // res.render('./user/partials/myProfile', {
        //     sessionData: req.session.useranything,
        //     userdata
        // })
        res.redirect('/myprofile')

    } else {
        res.redirect('/userlogin')
    }
}


function profileLogout(req, res) {
    req.session.destroy()
    res.redirect('/')

}


async function invoiceDownload(req, res) {
    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})

        let orderData = await Order.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)

                }
            }, {
                $lookup: {
                    from: 'usercollections',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'customerData'
                }
            }
        ])

        let salesData = []; // this array is created because the invoice report template cannot read the data like this.user[0].fName??????????????????


        for (let i = 0; i < orderData.length; i++) {
            let status

            let order = {

                first_name: orderData[i].customerData[0].first_name,
                amount: orderData[i].amount,
                status: status,
                orderDate: orderData[i].orderDate
            }
            salesData.push(order)
        }


        const html = fs.readFileSync(path.join(__dirname, '../views/user/invoiceDownload/invoice.html'), 'utf-8')
        const filename = Math.random() + '_doc' + '.pdf'
        const filepath = '/public/invoiceDownload/' + filename
        console.log('------------');
        console.log(salesData);
        console.log('------------');
        const document ={ 
            // page.paperSize = { format: 'A4', orientation: 'portrait', border: '1cm' };
            html: html,format:'A4', orientation: 'landscape',
            
            data: {
                salesData
            },
            path: './public/invoiceDownload/' + filename
        }
        pdf.create(document).then(resolve => {
            console.log(resolve)
            res.redirect(filepath)
        }).catch(err => {
            console.log(err);
        })
    }
}


async function getWishlist(req, res) {

    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})

        let wishlistdata = await Wishlist.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productinfo"
                }
            }, {
                $unwind: "$productinfo"
            }

        ])


        res.render('./user/partials/wishlist', {
            wishlistdata: wishlistdata,
            sessionData: req.session.useranything
        })


    } else {
        res.redirect('/userlogin')
    }

}


// -----

async function online(req, res) {
    let useremail = req.session.useranything
   
    let userdata = await userCollection.findOne({email: useremail})
   
    let userId = userdata._id;
  
    let cartData = await Cart.find({userId: userId})
    
    let totalAmt=0;
    for (let i = 0; i < cartData.length; i++) {
        totalAmt = totalAmt + cartData[i].amount
    }
console.log(totalAmt)
    


    await WriteOrderdata(req.body.paymode, req)
    console.log("---------->"+req.body.totamt);
 if (req.body.paymode == 'cod')
 {
    res.render('./user/partials/paymentsuccess', {sessionData: req.session.useranything});
return
 }
    if (req.body.paymode != 'cod') {


        if (req.session.useranything) {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://mermaidboutique.store/netamt?netamt="+totalAmt,
                    "cancel_url": "http://mermaidboutique.store/cancel"
                },
                "transactions": [
                    {
                        "item_list": {
                            "items": [
                                {
                                    "name": "Bridal Set",
                                    "sku": "B0001",
                                    "price": totalAmt,
                                    "currency": "USD",
                                    "quantity": 1
                                }
                            ]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": totalAmt
                        },
                        "description": "This is the payment description."
                    }
                ]
            };


            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            res.redirect(payment.links[i].href);
                        }
                    }
                }
            });


        } else {

            res.redirect('/')
            req.session.destroy()
        }

    }
   
}



// ----

async function success(req, res) {

    let total=req.query.netamt
     
     const payerId = req.query.PayerID;
     const paymentId = req.query.paymentId
     const execute_payment_json = {
 
         payer_id: payerId,
 
         transactions: [
             {
 
                 amount: {
 
                     currency: "USD",
                     "total": total
 
                 }
 
             }
         ]
 
     };
 
     paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
 
         if (error) {
 
             console.log(error.response);
 
             throw error;
 
         } else {
 
             console.log("Get Payment Response");
             console.log(JSON.stringify(payment));
 
 
             res.render('./user/partials/paymentsuccess', {sessionData: req.session.useranything});
 
         }
 
     });
 
 }
 
 
 async function WriteOrderdata(paymode, req) {
     
     let newOrderNo;
     const maxOrdno = await Order.aggregate([{
             $group: {
                 _id: 1,
                 maxno: {
                     $max: "$orderNo"
                 }
             }
         }])
     if (maxOrdno.length != 0) {
 
         newOrderNo = maxOrdno[0].maxno + 1;
     } else {
         newOrderNo = 1
     }
 
 
     let useremail = req.session.useranything
    
     let userdata = await userCollection.findOne({email: useremail})
    
     let userId = userdata._id;
   
     let cartData = await Cart.find({userId: userId})
     
     let totalAmt = 0;
     for (let i = 0; i < cartData.length; i++) {
         totalAmt = totalAmt + cartData[i].amount
     }
 
 
     await Order.create({
         userId: objectId(userdata._id),
         orderNo: newOrderNo,
         orderDate: Date(),
         paymode: paymode,
         totalAmount: totalAmt,
         couponCode: cartData[0].couponcode,
         discount: cartData[0].discount,
         products: [
             {
 
                 productId: cartData[0].productId,
                 quantity: cartData[0].quantity,
                 price: cartData[0].price,
                 amount: cartData[0].amount
             }
         ]
 
     })
 
    
     for (let i = 1; i < cartData.length; i++) {
         await Order.updateOne({
             orderNo: newOrderNo
         }, {
             $push: {
                 products: {
                     $each: [
                         {
                             productId: cartData[i].productId,
                             quantity: cartData[i].quantity,
                             price: cartData[i].price,
                             amount: cartData[i].amount
                         },
                     ]
                 }
             }
         })

        
     }
 
 
     await Cart.deleteMany({userId: userId})

 
 
 }
 
 
 function cancel(req, res) {
     res.send('cancelled')
 }
 

// -------------------

async function onlinePaypal(req, res) {


    if (req.session.useranything) {


        let newOrderNo;
        const maxOrdno = await Order.aggregate([{
                $group: {
                    _id: 1,
                    maxno: {
                        $max: "$orderNo"
                    }
                }
            }])
        if (maxOrdno.length != 0) {

            newOrderNo = maxOrdno[0].maxno + 1;
        } else {
            newOrderNo = 1
        }


        let useremail = req.session.useranything
        console.log("ssspppp" + useremail)
        let userdata = await userCollection.findOne({email: useremail})
        
        let userId = userdata._id;
        
        let cartData = await Cart.find({userId: userId})
        console.log(cartData)
        let totalAmt = 0;
        for (let i = 0; i < cartData.length; i++) {
            totalAmt = totalAmt + cartData[i].amount
        }


        await Order.create({
            userId: objectId(userdata._id),
            orderNo: newOrderNo,
            orderDate: Date(),
            paymode: req.body.paymode,
            totalAmount: totalAmt,
            products: [
                {

                    productId: cartData[0].productId,
                    quantity: cartData[0].quantity,
                    price: cartData[0].price,
                    amount: cartData[0].amount
                }
            ]

        })


        for (let i = 1; i < cartData.length; i++) {
            await Order.updateOne({
                orderNo: newOrderNo
            }, {
                $push: {
                    products: {
                        $each: [
                            {
                                productId: cartData[i].productId,
                                quantity: cartData[i].quantity,
                                price: cartData[i].price,
                                amount: cartData[i].amount
                            },
                        ]
                    }
                }
            })
        }


        await Cart.deleteMany({userId: userId})


        console.log("paymode" + req.body.paymode)
        // ----------------------------------------

        if (req.body.paymode != 'cod') {
            console.log("inside paymode")
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://mermaidboutique.store/success",
                    "cancel_url": "http://mermaidboutique.store/cancel"
                },
                "transactions": [
                    {
                        "item_list": {
                            "items": [
                                {
                                    "name": "Bridal Set",
                                    "sku": "B0001",
                                    "price": "15.00",
                                    "currency": "USD",
                                    "quantity": 1
                                }
                            ]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": "15.00"
                        },
                        "description": "This is the payment description."
                    }
                ]
            };


            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            res.redirect(payment.links[i].href);
                        }
                    }
                }
            });
        }


        res.render('./user/partials/paymentsuccess', {
            sessionData: req.session.useranything,
            userdata,
            cartData
        });

    } else {

        res.redirect('/')
        req.session.destroy()
    }
}


function userLogout(req, res) {
    req.session.destroy()
    res.redirect('/')

}


async function addToWishlist(req, res) {
    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})


        let productid = req.query.id
        console.log("here")
        console.log(req.query.id)


        let productdata = await Product.findOne({_id: productid})
        let checkproduct = await Wishlist.findOne({
            $and: [
                {
                    userId: objectId(userdata._id)
                }, {
                    productId: productid
                }
            ]
        })
        if (! checkproduct) {
            await Wishlist.create({
                userId: objectId(userdata._id),
                productId: productid,

                price: productdata.price


            })
        }


        res.redirect('/wishlist')

    } else {
        res.redirect('/userlogin')
    }
}


async function removeFromWishlist(req, res) {


    req.session.delete = req.params.id
    await Wishlist.deleteOne({
        _id: objectId(req.session.delete)
    })


    let useremail = req.session.useranything
    let userdata = await userCollection.findOne({email: useremail})

    await Wishlist.aggregate([
        {
            $match: {
                userId: objectId(userdata._id)
            }
        }, {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productinfo"
            }
        }, {
            $unwind: "$productinfo"
        }

    ])

    res.redirect(307, '/wishlist')
    // res.render('./user/partials/addtoCart', {cartdata, sessionData: req.session.useranything})
}


async function wishlistAddtoCart(req, res) {
    if (req.session.useranything) {
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})
        let wishlistdata = await Wishlist.findOne({_id: req.params.id})

        let productdata = await Product.findOne({
            _id: objectId(wishlistdata.productId)
        })
        let quantity = 1


        await Cart.create({
            userId: objectId(userdata._id),
            productId: productdata._id,
            quantity: quantity,
            price: productdata.price,
            amount: quantity * productdata.price

        })

        await Wishlist.deleteOne({_id: req.params.id})


        res.redirect('/wishlist')


    } else {
        res.redirect('/userlogin')
    }
}


async function applycoupon(req, res) {

    if (req.session.useranything) {
        const couponcode = req.query.couponcode
if(couponcode==="")
{
    let useremail = req.session.useranything
    let userdata = await userCollection.findOne({email: useremail})
    let userId = userdata._id;
   


    let quantity = parseInt(req.body.quantity)

    let productid = req.query.id

    let productdata = await Product.findOne({_id: productid})

    let cartdata = await Cart.aggregate([
        {
            $match: {
                userId: objectId(userdata._id)
            }
        }, {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productinfo"
            }
        }, {
            $unwind: "$productinfo"
        }

    ])

    res.render('./user/partials/addtoCart', {
        sessionData: req.session.useranything,
        cartdata: cartdata,

        productdata: productdata,
        userdata: userdata,
        quantity: quantity
    })
    return

}
        let useremail = req.session.useranything
        let userdata = await userCollection.findOne({email: useremail})
        let userId = userdata._id;
       


        let quantity = parseInt(req.body.quantity)

        let productid = req.query.id

        let productdata = await Product.findOne({_id: productid})


        const coupondata = await Coupon.findOne({couponCode: couponcode})

        
        if (coupondata) {
           console.log(coupondata.unlist)
            if(coupondata.unlist==true){
                let useremail = req.session.useranything
    let userdata = await userCollection.findOne({email: useremail})
    let userId = userdata._id;
   


    let quantity = parseInt(req.body.quantity)

    let productid = req.query.id

    let productdata = await Product.findOne({_id: productid})

    let cartdata = await Cart.aggregate([
        {
            $match: {
                userId: objectId(userdata._id)
            }
        }, {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productinfo"
            }
        }, {
            $unwind: "$productinfo"
        }

    ])
                
                res.render('./user/partials/addtoCart', {
                    sessionData: req.session.useranything,
                    cartdata: cartdata,
    
                    productdata: productdata,
                    userdata: userdata,
                    quantity: quantity,check5:"This Coupon is currently not available"
                })
                return
            }

            let checkcouponused = await Order.findOne({
                $and: [
                    {
                        userId: objectId(userdata._id),
                        couponCode: couponcode
                    }
                ]
            })


            let checkcouponusedincart = await Cart.findOne({
                $and: [
                    {
                        userId: objectId(userdata._id),
                        couponcode: couponcode
                    }
                ]
            })


            if (checkcouponused||checkcouponusedincart) {
                let cartdata = await Cart.aggregate([
                    {
                        $match: {
                            userId: objectId(userdata._id)
                        }
                    }, {
                        $lookup: {
                            from: "products",
                            localField: "productId",
                            foreignField: "_id",
                            as: "productinfo"
                        }
                    }, {
                        $unwind: "$productinfo"
                    }
        
                ])

                res.render('./user/partials/addtoCart', {
                    sessionData: req.session.useranything,
                    cartdata: cartdata,

                    productdata: productdata,
                    userdata: userdata,
                    quantity: quantity,check3:"Coupon Already Applied"
                })
                return
            }

            let carttotal = await Cart.find({userId: objectId(userdata._id)})
            let totalAmt = 0;
            for (let i = 0; i < carttotal.length; i++) {
                totalAmt = totalAmt + carttotal[i].amount
            }

            let discountAmount = coupondata.discount
            let netamount = totalAmt - discountAmount
            let cartcouponupdate = await Cart.updateOne({
                userId: userId
            }, {
                $set: {
                    discount: discountAmount,
                    couponcode: couponcode,
                    amount: netamount
                }
            })


            let cartdata = await Cart.aggregate([
                {
                    $match: {
                        userId: objectId(userdata._id)
                    }
                }, {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productinfo"
                    }
                }, {
                    $unwind: "$productinfo"
                }
    
            ])
            res.render('./user/partials/addtoCart', {
                sessionData: req.session.useranything,
                cartdata: cartdata,

                productdata: productdata,
                userdata: userdata,
                quantity: quantity
            })
            

        } else { // res.redirect('/categories/selectproduct/addtocart')
            let cartdata = await Cart.aggregate([
                {
                    $match: {
                        userId: objectId(userdata._id)
                    }
                }, {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productinfo"
                    }
                }, {
                    $unwind: "$productinfo"
                }
    
            ])
            res.render('./user/partials/addtoCart', {
                sessionData: req.session.useranything,
                cartdata: cartdata,

                productdata: productdata,
                userdata: userdata,
                quantity: quantity,check:"Invalid Code"
            })
            console.log("code wrong")
        }
    } else {
        res.redirect('/userlogin')
    }
}


async function cartQtyMinus(req, res) {


    let price = await Cart.findOne({
        _id: objectId(req.params.id)
    })
    await Cart.updateOne({
        _id: objectId(req.params.id)
    }, {
        $inc: {
            quantity: -1,
            amount: - price.price
        }
    })

    const cartcount = await Cart.find({})
    let useremail = req.session.useranything
    let userdata = await userCollection.findOne({email: useremail})

    let cartdata = await Cart.aggregate([
        {
            $match: {
                userId: objectId(userdata._id)
            }
        }, {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productinfo"
            }
        }, {
            $unwind: "$productinfo"
        }

    ])

    // res.redirect(307,'/categories/selectproduct/addtocart')
    res.render('./user/partials/addtoCart', {
        cartdata,
        sessionData: req.session.useranything,
        cartcount
    })
}

async function cartQtyPlus(req, res) {


    let price = await Cart.findOne({
        _id: objectId(req.params.id)
    })
    console.log("-----------------------------------" + price)
    await Cart.updateOne({
        _id: objectId(req.params.id)
    }, {
        $inc: {
            quantity: 1,
            amount: price.price
        }
    })

    const cartcount = await Cart.find({})
    let useremail = req.session.useranything
    let userdata = await userCollection.findOne({email: useremail})

    let cartdata = await Cart.aggregate([
        {
            $match: {
                userId: objectId(userdata._id)
            }
        }, {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productinfo"
            }
        }, {
            $unwind: "$productinfo"
        }

    ])

    // res.redirect(307,'/categories/selectproduct/addtocart')
    res.render('./user/partials/addtoCart', {
        cartdata,
        sessionData: req.session.useranything,
        cartcount
    })
}



async function applywheeldiscount(req, res) {
    
    const userdata=await userCollection.findOne({email:req.session.useranything})
    const totamt = await Cart.aggregate([
        {
            $match: {
                userId: objectId(userdata._id)
            }
        },
        {$group: {
            _id: 1,
            total: {
                $sum: "$amount"
            }
        }
    }])
    //no users

   


    let disamt=totamt[0].total*req.params.discount/100
    disamt=disamt.toFixed(2)
    let netamt=totamt[0].total-disamt
    netamt=netamt.toFixed(2)
    let cartapplydiscount = await Cart.updateMany({
        userId: userdata._id
    }, {
        $set: {
            discount: disamt,
            couponcode: 'SPINDIS',
            amount: netamt
        }
    })
    res.redirect('/addtoCart')
}


async function wheelspin(req, res) {

    const userdata=await userCollection.findOne({email:req.session.useranything})

    let checkAlreadyspinned = await Cart.findOne({
        $and: [
            {
                userId: objectId(userdata._id),
                couponcode: 'SPINDIS'
            }
        ]
    })
    if(checkAlreadyspinned){
       
        // res.redirect('/addtoCart')
        let cartdata = await Cart.aggregate([
            {
                $match: {
                    userId: objectId(userdata._id)
                }
            }, {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productinfo"
                }
            }, {
                $unwind: "$productinfo"
            }
    
        ])
        res.render('./user/partials/addtoCart', {sessionData: req.session.useranything,cartdata,spinmsg: "You tried your luck already!!"})
        return
    }

    res.render('./user/partials/wheelspin', {sessionData: req.session.useranything})
}

async function cartcount(req,res){
    if(!req.session.useranything){
        return
    }
    const userdata=await userCollection.findOne({email:req.session.useranything})
    const ccount=await Cart.find({userId:userdata._id})
    res.send({cartcount:ccount.length})
}


 function errorpage(req,res){
   res.render('./user/partials/404page');
}



module.exports = {
    userhome,
    userLogin,
    homeuserValidation,
    userSignup,
    userRegister,
    userRegistered,
    otpValidation,
    forgotPassword,
    userLogout,
    getCategory,
    getSelectCategory,
    getProduct,
    getAddtoCart,
    postAddtoCart,
    removeFromCart,
    getMakePayment,
    wheelspin,
    editorder,
    getOrderView,
    myProfile,
    changePassword,
    postPasswordChanged,
    changeAddress,
    postAddressChanged,
    profileLogout,
    addAddress,
    invoiceDownload,
    productSearch,
    getWishlist,
    saveProfilePic,
    online,
    success,
    cancel,
    addToWishlist,
    removeFromWishlist,
    wishlistAddtoCart,
    applycoupon,
    cartQtyMinus,
    cartQtyPlus,
    applywheeldiscount,
    cartcount,
    errorpage

}
