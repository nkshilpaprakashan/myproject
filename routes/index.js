const express=require('express')
const router=express.Router()
const upload = require('../config/multer')
const adminController=require('../controllers/adminController')


router.get('/adminloginpage',adminController.login)

router.post('/validation',adminController.validation)

router.get('/adminloginpage/Dashboard',adminController.adminDashboard)

router.get('/adminloginpage/adminLogout',adminController.adminLogout)

router.get('/adminloginpage/Dashboard/customers', adminController.customers)

router.get('/adminloginpage/Dashboard/customers/blockuser/:id',adminController.blockuser)

router.get('/adminloginpage/Dashboard/customers/unblockuser/:id',adminController.unblockuser)

router.get('/adminloginpage/Dashboard/customers/edits/:id',adminController.customerEdit)

router.post('/adminloginpage/Dashboard/customers/updateUser/:id',adminController.updateCustomer)

router.get('/adminloginpage/Dashboard/customers/delete/:id',adminController.deleteCustomer)

router.get('/adminloginpage/Dashboard/products', adminController.products)

router.get('/adminloginpage/Dashboard/products/addproduct', adminController.addproduct)

router.get('/adminloginpage/Dashboard/products/list/:id',adminController.productlist)

router.get('/adminloginpage/Dashboard/products/unlist/:id',adminController.productunlist)

router.post('/adminloginpage/Dashboard/products/addproduct/saveproduct',upload.array('image',4), adminController.saveProduct)

router.get('/adminloginpage/Dashboard/categories',adminController.categories)

router.get('/adminloginpage/Dashboard/categories/addcategory',adminController.addcategory)

router.post('/adminloginpage/Dashboard/categories/addcategory/createCategory',adminController.createCategory)

router.get('/adminloginpage/Dashboard/categories/editcategory/:id',adminController.editcategory)

router.post('/adminloginpage/Dashboard/categories/editcategory/saveEditcategory/:id',adminController.saveeditcategory)

router.get('/adminloginpage/Dashboard/categories/list/:id',adminController.list)

router.get('/adminloginpage/Dashboard/categories/unlist/:id',adminController.unlist)

router.get('/adminloginpage/Dashboard/products/editproduct',adminController.editproduct)

router.post('/adminloginpage/Dashboard/products/editproduct/saveEditproduct',upload.array('image',4),adminController.saveeditproduct)

router.get('/adminloginpage/Dashboard/order',adminController.getorder)

router.get('/adminloginpage/Dashboard/orderdetails/:id',adminController.orderDetails)

router.get('/adminloginpage/Dashboard/salesReportDownload',adminController.salesReportDownload)

router.get('/adminloginpage/Dashboard/salesReport',adminController.salesReport)

router.get('/adminloginpage/Dashboard/datewisesales',adminController.dateWiseSales)





router.get('/adminloginpage/Dashboard/order/status',adminController.orderStatus)

router.get('/adminloginpage/Dashboard/coupon',adminController.coupon)

router.get('/adminloginpage/Dashboard/coupon/addcoupon',adminController.addCoupon)

router.post('/adminloginpage/Dashboard/coupon/addcoupon',adminController.postAddCoupon)

router.get('/adminloginpage/Dashboard/coupon/editcoupon/:id',adminController.editCoupon)

router.patch('/adminloginpage/Dashboard/coupon/list',adminController.couponList)

router.patch('/adminloginpage/Dashboard/coupon/unlist',adminController.couponUnlist)

router.post('/adminloginpage/Dashboard/coupon/unlist/saveEditcoupon/:id',adminController.saveeditcoupon)















module.exports=router