const userCollection = require('../models/userRegister')
const Product = require('../models/products')
const Category = require('../models/category')
const Group = require('../models/group')
const Order = require('../models/order')
const Coupon = require('../models/coupon')
const pdf = require('pdf-creator-node')
const fs = require('fs')
const path = require('path')
const {log} = require('console')
const { order } = require('paypal-rest-sdk')

var objectId = require('mongodb').ObjectId

function login(req, res) {
    try{
    if (req.session.admin) {
        res.redirect('/adminloginpage/Dashboard')
    } else {


        res.render('./admin/partials/index', {wrong: req.session.adminanything});
        req.session.destroy()
    }

}catch(error){
    res.redirect('/errorpage')
}}


async function adminDashboard(req, res) {
    try{
    if (req.session.admin) {
        let userdata = await userCollection.find()
        let categorydata = await Category.find()
        let productdata = await Product.find()
        let orderdata = await Order.find()
        

       let dateorderdate=await Order.aggregate([{$project:{"orderDate":1,_id:0}}])
       let date=new Date(dateorderdate[0].orderDate)
       console.log(date)
       console.log(typeof(date))

       let monthlysale=await Order.aggregate([
        {
          $group: {
             _id: {
                month: { $month: "$orderDate"},
                year: { $year: "$orderDate" } 
             },
             total: {
                $sum: "$totalAmount"
             } 
          }
        }
     ])

        
        let ordertot=0
        let totalCod=0
       let totalPaypal=0
        
        if(orderdata){
            
            for(let i=0;i<orderdata.length;i++){
                ordertot=ordertot+orderdata[i].totalAmount
                if(orderdata[i].paymode==="cod"){
                    totalCod=totalCod+orderdata[i].totalAmount
                }else{
                    totalPaypal=totalPaypal+orderdata[i].totalAmount
                }

            }

        }
        
        res.render('./admin/partials/admindashboard', {
            fulldata: userdata,
            categorydata: categorydata,
            productdata:productdata,
            orderdata:orderdata,ordertot,
            totalCod,totalPaypal,monthlysale
        });
    } else {
        res.redirect('/adminloginpage')
    }
}catch(error){
    res.redirect('/errorpage')
}}


function validation(req, res) {
    try{
    let adminEmail = 'admin@gmail.com'
    let adminPassword = '1'
    if (req.body.email === adminEmail && req.body.password === adminPassword) {
        req.session.admin = true
        res.redirect('adminloginpage/Dashboard')
    } else {
        req.session.adminanything = true
        res.redirect('/adminloginpage')
    }
}catch(error){
    res.redirect('/errorpage')
}}

function adminLogout(req, res) {
    req.session.destroy()
    res.redirect('/adminloginpage')
}

async function customers(req, res) {
    try{

    if (req.session.admin) {
        let userdata = await userCollection.find()
        res.render('./admin/partials/customerPage', {fulldata: userdata});
    } else {
        res.redirect('/adminloginpage',)
    }
}catch(error){
    res.redirect('/errorpage')
}}


async function blockuser(req, res) {
    try {
        await userCollection.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                isBlocked: true
            }
        }).then(() => {
            res.redirect('/adminloginpage/Dashboard/customers');
        });
    } catch (error) {
        console.log(error.message);
        
            res.redirect('/errorpage')
       

    }
}
async function unblockuser(req, res) {
    try {
        await userCollection.updateOne({
            _id: req.params.id
        }, {
            $set: {
                isBlocked: false
            }
        }).then(() => {
            res.redirect('/adminloginpage/Dashboard/customers');
        });
    } catch (error) {
        console.log(error.message);
        
            res.redirect('/errorpage')
       
    }
}


async function customerEdit(req, res) {
    try{
    let userid = req.params.id
    // res.render('editpage')
    userCollection.findByIdAndUpdate({
        _id: objectId(userid)
    }, req.body, {
        new: true
    }, (err, docs) => {
        if (err) {
            console.log("no edit")

        } else {
            console.log("updated")
            res.render('./admin/partials/editpage', {userCollection: docs})

        }
    })
}catch(error){
    res.redirect('/errorpage')
}}

async function updateCustomer(req, res) {
    try{

    let userid = req.params.id
    userCollection.findByIdAndUpdate({
        _id: objectId(userid)
    }, req.body, (err) => {

        if (err) {
            console.log("no edit")

        } else {

            console.log("updated")
            res.redirect('/adminloginpage/Dashboard/customers')

        }
    })
}catch(error){
    res.redirect('/errorpage')
}}


async function deleteCustomer(req, res) {
    try{
    req.session.delete = req.params.id
    await userCollection.deleteOne({
        _id: objectId(req.session.delete)
    })
    res.redirect('/adminloginpage/Dashboard/customers')
}catch(error){
    res.redirect('/errorpage')
}}

async function products(req, res) {
    try{
    if (req.session.admin) {
        let productdata = await Product.find()
        let categorydata = await Category.find()


        res.render('./admin/partials/productPage', {
            productdata: productdata,
            categorydata: categorydata
        });
    } else {
        res.redirect('/adminloginpage',)
    }
}catch(error){
    res.redirect('/errorpage')
}}


async function addproduct(req, res) {
    try{
    if (req.session.admin) {
        let groupdata = await Group.find()
        let categorydata = await Category.find({unlist: false})
        res.render('./admin/partials/addProductpage', {
            groupdata: groupdata,
            categorydata: categorydata
        })
    } else {
        res.redirect('/adminloginpage',)
    }

}catch(error){
    res.redirect('/errorpage')
}}


async function saveProduct(req, res) {

    try {

        const product = new Product({
            item_code: req.body.item_code,
            item_name: req.body.item_name,
            product_description: req.body.product_description,
            groupName: req.body.groupName,
            categoryName: req.body.categoryName,
            size: req.body.size,
            price: req.body.price,
            mrp: req.body.mrp,
            available_quantity: req.body.available_quantity,
            product_unit: req.body.product_unit,
            percentage_discount: req.body.percentage_discount,
            image: req.files
        })
        console.log(req.body.groupName)
        console.log(req.body.categoryName)

        await product.save()

        res.status(201).redirect('/adminloginpage/Dashboard/products/addproduct');


    } catch (error) {

        res.status(400).send(error);
       
            res.redirect('/errorpage')
        

    }
}


async function categories(req, res) {
    try{
    if (req.session.admin) {
        let categorydata = await Category.find()
        res.render('./admin/partials/categoryPage', {categorydata: categorydata});
    } else {
        res.redirect('/adminloginpage',)
    }
}catch(error){
    res.redirect('/errorpage')
}}


async function addcategory(req, res) {
    try{
    if (req.session.admin) {
        let groupdata = await Group.find()
        console.log(groupdata)

        res.render('./admin/partials/addCategorypage', {group: groupdata});
    } else {
        res.redirect('/adminloginpage',)
    }

}catch(error){
    res.redirect('/errorpage')
}}

async function createCategory(req, res) {
    try {

        const category = new Category({groupName: req.body.groupName, categoryName: req.body.categoryName})

        const categoryCheck = await Category.findOne({categoryName: req.body.categoryName})

        if (categoryCheck) {

            let groupdata = await Group.find()

            res.render('./admin/partials/addCategorypage', {
                message: "This category Already Exists",
                group: groupdata
            })


        } else {
            await category.save()
            res.redirect('/adminloginpage/Dashboard/categories');


        }
    } catch (error) {

        res.status(400).send(error);
        
            res.redirect('/errorpage')
       
    }
}

async function editcategory(req, res) {
    try{
    let categoryid = req.params.id
    let groupdata = await Group.find()

    let updateData = await Category.findOne({_id: objectId(categoryid)})
    res.render('./admin/partials/editCategoryPage', {
        categorydata: updateData,
        group: groupdata
    })
}catch(error){
    res.redirect('/errorpage')
}}


function saveeditcategory(req, res) {
    try{
    let categoryid = req.params.id

    Category.findByIdAndUpdate({
        _id: objectId(categoryid)
    }, req.body, (err) => {

        if (err) {
            console.log("no edit")

        } else {

            console.log("updated")
            res.redirect('/adminloginpage/Dashboard/categories')

        }
    })
}catch(error){
    res.redirect('/errorpage')
}}


async function list(req, res) {
   

    const catdata = await Category.findOne({_id: req.params.id})
    if (catdata) {

        await Product.updateMany({
            categoryName: catdata.categoryName
        }, {
            $set: {
                unlist: false
            }
        })

    } else {
        console.log("category not found")
    }

    try {
        await Category.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                unlist: false
            }
        })


        res.redirect('/adminloginpage/Dashboard/categories');


    } catch (error) {
        console.log(error.message);

    }
}

async function unlist(req, res) {
    const catdata = await Category.findOne({_id: req.params.id})
    if (catdata) {

        await Product.updateMany({
            categoryName: catdata.categoryName
        }, {
            $set: {
                unlist: true
            }
        })

    } else {
        console.log("category not found")
    }

    try {
        await Category.updateOne({
            _id: req.params.id
        }, {
            $set: {
                unlist: true
            }
        }).then(() => {
            res.redirect('/adminloginpage/Dashboard/categories');
        });
    } catch (error) {
        console.log(error.message);
    }
}

let editData;

async function editproduct(req, res) {
    try{
    editData = req.query.id
    let groupdata = await Group.find()
    let categorydata = await Category.find()

    let productdata = await Product.findOne({_id: req.query.id})
    res.render('./admin/partials/editProductpage', {
        productdata: productdata,
        group: groupdata,
        category: categorydata
    })
}catch(error){
    res.redirect('/errorpage')
}}

async function saveeditproduct(req, res) {
    try{
    console.log(req.query.id);
    await Product.updateOne({
        _id: editData
    }, {
        $set: {

            item_code: req.body.item_code,
            item_name: req.body.item_name,
            product_description: req.body.product_description,
            groupName: req.body.groupName,
            categoryName: req.body.categoryName,
            size: req.body.size,
            price: req.body.price,
            mrp: req.body.mrp,
            available_quantity: req.body.available_quantity,
            product_unit: req.body.product_unit,
            percentage_discount: req.body.percentage_discount,
            image: req.files
        }
    })

    res.redirect('/adminloginpage/Dashboard/products')

}catch(error){
    res.redirect('/errorpage')
}}


async function productlist(req, res) {
    try {

        await Product.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                unlist: false
            }
        }).then(() => {
            res.redirect('/adminloginpage/Dashboard/products');
        });


    } catch (error) {
        console.log(error.message);

    }
}
async function productunlist(req, res) {
    try {
        await Product.updateOne({
            _id: req.params.id
        }, {
            $set: {
                unlist: true
            }
        }).then(() => {
            res.redirect('/adminloginpage/Dashboard/products');
        });
    } catch (error) {
        console.log(error.message);
        
            res.redirect('/errorpage')
       
    }
}


async function getorder(req, res) {
    try{
    if (req.session.admin) { // let orderdata=await Order.find()
        let userdata = await userCollection.find()

        let orderdata = await Order.aggregate([{
                $lookup: {
                    from: 'usercollections',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'customerData'
                }
                 }, { $sort : { orderNo : -1 } }
                ])

        


        res.render('./admin/partials/order', {
            orderdata: orderdata,
            userdata: userdata
        });
    } else {
        res.redirect('/adminloginpage',)
    }
}catch(error){
    res.redirect('/errorpage')
}}


async function salesReportDownload(req, res) {
   

    let orderData = await Order.aggregate([{
            $lookup: {
                from: 'usercollections',
                localField: 'userId',
                foreignField: '_id',
                as: 'customerData'
            }
        }])

    let salesData = []; // this array is created because the sales report template cannot read the data like this.user[0].fName??????????????????


    for (let i = 0; i < orderData.length; i++) {
        let orderstatus
        if (orderData[i].status) {
            orderstatus = 'Delivered'
        } else {
            orderstatus = 'Pending'
        }
        
        let order = {
            orderNo:orderData[i].orderNo,
            first_name: orderData[i].customerData[0].first_name,
            amount: orderData[i].totalAmount,
            orderstatus: orderstatus,
            orderDate: orderData[i].orderDate
        }
        salesData.push(order)
    }

    let totalAmount = 0;
    for (let i = 0; i < orderData.length; i++) {
        totalAmount = totalAmount + orderData[i].totalAmount
    }


    const html = fs.readFileSync(path.join(__dirname, '../views/admin/salesReport/salesReport.html'), 'utf-8')
    const filename = Math.random() + '_doc' + '.pdf'
    const filepath = '/public/salesReports/' + filename
    console.log('------------');
    console.log(salesData);
    console.log('------------');
    const document = {
        html: html,
        data: {
            salesData,
            totalAmount
        },
        path: './public/salesReports/' + filename
    }
    pdf.create(document).then(resolve => {
        console.log(resolve)
        res.redirect(filepath)
    }).catch(err => {
        console.log(err);
    })
}


async function delivered(req, res) {


    await Order.findOne({_id: req.params.id})


    try {
        await Order.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                status: false
            }
        })


        res.redirect('/adminloginpage/Dashboard/order');


    } catch (error) {
        console.log(error.message);

    }
}

async function orderStatus(req, res) {

    await Order.findOne({_id: req.query.id})


    try {
        await Order.findByIdAndUpdate({
            _id: req.query.id
        }, {
            $set: {
                orderstatus: req.query.orderstatus
            }
        })

       


        res.redirect('/adminloginpage/Dashboard/order');


    } catch (error) {
        console.log(error.message);

    }
}


async function coupon(req, res) {

    try{
    if (req.session.admin) {
        let coupondata = await Coupon.find()
       


        res.render('./admin/partials/coupon', {
            coupondata: coupondata
            
        });
    } else {
        res.redirect('/adminloginpage',)
    }
}catch(error){
    res.redirect('/errorpage')
}}


async function addCoupon(req, res) {
    try{
    if (req.session.admin) {
        let groupdata = await Group.find()
        let categorydata = await Category.find({unlist: false})
        res.render('./admin/partials/addCoupon', {
            groupdata: groupdata,
            categorydata: categorydata
        })
    } else {
        res.redirect('/adminloginpage',)
    }

}catch(error){
    res.redirect('/errorpage')
}}


async function postAddCoupon(req, res) {
    if (req.session.admin) {


        try {

            const coupon = new Coupon({
                couponCode: req.body.couponCode,
                couponName: req.body.couponName,
                discount: req.body.discount,
                startingDate: req.body.startingDate,
                expiryDate: req.body.expiryDate,
                minAmount: req.body.minAmount

            })


            await coupon.save()

            res.status(201).redirect('/adminloginpage/Dashboard/coupon');


        } catch (error) {

            res.status(400).send(error);


        }
    }

}


async function editCoupon(req, res) {
    try{
    let couponid = req.params.id
   

    let coupondata = await Coupon.findOne({_id: objectId(couponid)})
    res.render('./admin/partials/editCoupon', {
        coupondata
    })
}catch(error){
    res.redirect('/errorpage')
}}



async function couponList(req, res) {
    try{

    if (req.session.admin){
        const coupon=req.body
        const couponid=coupon.couponid
        await Coupon.findByIdAndUpdate({
            _id: couponid
        }, {
            $set: {
                unlist: false
            }
        })
        res.json({result:true})

        // res.redirect('/adminloginpage/Dashboard/coupon');


    }
}catch(error){
    res.redirect('/errorpage')
}}




async function couponUnlist(req, res) {
    try{
    if (req.session.admin){
        const coupon=req.body
        const couponid=coupon.couponid
        await Coupon.updateOne({
            _id: couponid
        }, {
            $set: {
                unlist: true
            }
        }).then(() => {
            res.json({result:true})
        });
    
}

}catch(error){
    res.redirect('/errorpage')
}}



async function saveeditcoupon(req, res) {
    try{
    
    
    await Coupon.updateOne({
        _id: req.params.id
    }, {
        $set: {

            couponCode: req.body.couponCode,
            couponName: req.body.couponName,
            discount: req.body.discount,
            startingDate: req.body.startingDate,
            expiryDate: req.body.expiryDate,
            minAmount: req.body.minAmount
        }
    })

    res.redirect('/adminloginpage/Dashboard/coupon')

}catch(error){
    res.redirect('/errorpage')
}}


async function orderDetails(req, res) {
    try {
        if (req.session.admin){
            const orderdata = await Order.findOne({_id: req.params.id})
            
            let userdetails = await userCollection.findOne({ _id: objectId(orderdata.userId)})

            
        let orderdataproduct = await Order.aggregate([
            {
                $match: {
                    _id: objectId(req.params.id)
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

        console.log(orderdataproduct)
                   
 res.render('./admin/partials/orderviewdetails',{orderdata,userdetails,orderdataproduct});
        }
    } catch (error) {
        console.log(error.message);
    }
}



async function salesReport(req, res) {
    try{
        if (req.session.admin) { // let orderdata=await Order.find()
            let userdata = await userCollection.find()
    
            let orderdata = await Order.aggregate([
                {$match:{
                    orderstatus:'Delivered'
                }},
                   { $lookup: {
                        from: 'usercollections',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'customerData'
                    }
                     }, { $sort : { orderNo : -1 } }
                    ])
    
            
    
    
            res.render('./admin/partials/salesReport', {
                orderdata: orderdata,
                userdata: userdata
            });
        } else {
            res.redirect('/adminloginpage',)
        }
    }
    catch(error){
    
    res.redirect('/errorpage')
    }
}


async function dateWiseSales(req, res) {
    
        if (req.session.admin) {
            let userdata = await userCollection.find()

           console.log(Date(req.query.todate))
           console.log(req.query.fromdate)
    let fromdate=new Date(req.query.fromdate)
    let todate=new Date(req.query.todate)
    console.log(todate)
            let orderdata = await Order.aggregate([
                {$match:{$and:[
                    {orderstatus:'Delivered'},
                    {orderDate:{$gte:fromdate}},
                    {orderDate:{$lte:todate}}
                ]}
                   
                },
                   { $lookup: {
                        from: 'usercollections',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'customerData'
                    }
                     }, { $sort : { orderNo : -1 } }
                    ])
    
            
    console.log(orderdata)
    
            res.render('./admin/partials/salesReport', {
                orderdata: orderdata,
                userdata: userdata
            });
        } else {
            res.redirect('/adminloginpage',)
        }
    }
    








module.exports = {
    login,
    adminDashboard,
    validation,
    adminLogout,
    customers,
    products,
    addproduct,
    categories,
    addcategory,
    customerEdit,
    updateCustomer,
    deleteCustomer,
    blockuser,
    unblockuser,
    createCategory,
    saveProduct,
    editcategory,
    saveeditcategory,
    list,
    unlist,
    editproduct,
    saveeditproduct,
    getorder,
    salesReportDownload,
    salesReport,
    productlist,
    productunlist,
    delivered,
    orderStatus,
    coupon,
    addCoupon,
    postAddCoupon,
    editCoupon,
    couponList,
    couponUnlist,
    saveeditcoupon,
    orderDetails,
    dateWiseSales

}
