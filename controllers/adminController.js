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

var objectId = require('mongodb').ObjectId

function login(req, res) {
    if (req.session.admin) {
        res.redirect('/adminloginpage/Dashboard')
    } else {


        res.render('./admin/partials/index', {wrong: req.session.adminanything});
        req.session.destroy()
    }

}


async function adminDashboard(req, res) {
    if (req.session.admin) {
        let userdata = await userCollection.find()
        let categorydata = await Category.find()
        let productdata = await Product.find()
        let orderdata = await Order.find()
        res.render('./admin/partials/admindashboard', {
            fulldata: userdata,
            categorydata: categorydata,
            productdata:productdata,
            orderdata:orderdata
        });
    } else {
        res.redirect('/adminloginpage')
    }
}


function validation(req, res) {
    let adminEmail = 'admin@gmail.com'
    let adminPassword = '1'
    if (req.body.email === adminEmail && req.body.password === adminPassword) {
        req.session.admin = true
        res.redirect('adminloginpage/Dashboard')
    } else {
        req.session.adminanything = true
        res.redirect('/adminloginpage')
    }
}

function adminLogout(req, res) {
    req.session.destroy()
    res.redirect('/adminloginpage')
}

async function customers(req, res) {

    if (req.session.admin) {
        let userdata = await userCollection.find()
        res.render('./admin/partials/customerPage', {fulldata: userdata});
    } else {
        res.redirect('/adminloginpage',)
    }
}


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
    }
}


async function customerEdit(req, res) {
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
}

async function updateCustomer(req, res) {

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
}


async function deleteCustomer(req, res) {
    req.session.delete = req.params.id
    await userCollection.deleteOne({
        _id: objectId(req.session.delete)
    })
    res.redirect('/adminloginpage/Dashboard/customers')
}

async function products(req, res) {
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
}


async function addproduct(req, res) {
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

}


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


    }
}


async function categories(req, res) {
    if (req.session.admin) {
        let categorydata = await Category.find()
        res.render('./admin/partials/categoryPage', {categorydata: categorydata});
    } else {
        res.redirect('/adminloginpage',)
    }
}


async function addcategory(req, res) {
    if (req.session.admin) {
        let groupdata = await Group.find()
        console.log(groupdata)

        res.render('./admin/partials/addCategorypage', {group: groupdata});
    } else {
        res.redirect('/adminloginpage',)
    }

}

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

    }
}

async function editcategory(req, res) {
    let categoryid = req.params.id
    let groupdata = await Group.find()

    let updateData = await Category.findOne({_id: objectId(categoryid)})
    res.render('./admin/partials/editCategoryPage', {
        categorydata: updateData,
        group: groupdata
    })
}


function saveeditcategory(req, res) {
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
}


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
    editData = req.query.id
    let groupdata = await Group.find()
    let categorydata = await Category.find()

    let productdata = await Product.findOne({_id: req.query.id})
    res.render('./admin/partials/editProductpage', {
        productdata: productdata,
        group: groupdata,
        category: categorydata
    })
}

async function saveeditproduct(req, res) {
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

}


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
    }
}


async function getorder(req, res) {
    if (req.session.admin) { // let orderdata=await Order.find()
        let userdata = await userCollection.find()

        let orderdata = await Order.aggregate([{
                $lookup: {
                    from: 'usercollections',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'customerData'
                }
            }])

        console.log(orderdata);


        res.render('./admin/partials/order', {
            orderdata: orderdata,
            userdata: userdata
        });
    } else {
        res.redirect('/adminloginpage',)
    }
}


async function salesReport(req, res) {

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
        let status
        if (orderData[i].status) {
            status = 'Delivered'
        } else {
            status = 'Pending'
        }
        let order = {

            first_name: orderData[i].customerData[0].first_name,
            amount: orderData[i].totalAmount,
            status: status,
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

async function orderPending(req, res) {

    await Order.findOne({_id: req.params.id})


    try {
        await Order.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                status: true
            }
        })


        res.redirect('/adminloginpage/Dashboard/order');


    } catch (error) {
        console.log(error.message);

    }
}


async function coupon(req, res) {
    if (req.session.admin) {
        let coupondata = await Coupon.find()
       


        res.render('./admin/partials/coupon', {
            coupondata: coupondata
            
        });
    } else {
        res.redirect('/adminloginpage',)
    }
}


async function addCoupon(req, res) {
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

}


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
    let couponid = req.params.id
   

    let coupondata = await Coupon.findOne({_id: objectId(couponid)})
    res.render('./admin/partials/editCoupon', {
        coupondata
    })
}



async function couponList(req, res) {

    if (req.session.admin){
        await Coupon.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                unlist: false
            }
        })


        res.redirect('/adminloginpage/Dashboard/coupon');


    }
}




async function couponUnlist(req, res) {
    if (req.session.admin){
    
        await Coupon.updateOne({
            _id: req.params.id
        }, {
            $set: {
                unlist: true
            }
        }).then(() => {
            res.redirect('/adminloginpage/Dashboard/coupon');
        });
    
}

}



async function saveeditcoupon(req, res) {
    
    
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
    salesReport,
    productlist,
    productunlist,
    delivered,
    orderPending,
    coupon,
    addCoupon,
    postAddCoupon,
    editCoupon,
    couponList,
    couponUnlist,
    saveeditcoupon

}
