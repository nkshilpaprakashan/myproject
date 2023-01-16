const express=require('express')
const router=express.Router()
const upload = require('../config/multer')
const userController=require('../controllers/userController')



router.get('/',userController.userhome)

router.get('/userlogin',userController.userLogin)

router.post('/homeuservalidation',userController.homeuserValidation)

router.get('/userlogin/usersignup', userController.userSignup)

router.get('/userlogin/usersignup/register', userController.userRegister)

router.post('/userlogin/usersignup/register', userController.userRegistered)

router.post('/otp', userController.otpValidation)

router.get('/userlogin/forgotpassword/:emailid', userController.forgotPassword) 


router.get('/categories/groupname', userController.getCategory)

router.get('/categories/selectcategory', userController.getSelectCategory)

router.get('/categories/selectproduct', userController.getProduct)

router.get('/addtocart', userController.getAddtoCart)

router.post('/categories/selectproduct/addtocart', userController.postAddtoCart)

router.get('/categories/selectproduct/addtocart/removeFromCart/:id', userController.removeFromCart)

router.get('/categories/selectproduct/addtocart/makepayment', userController.getMakePayment)

router.get('/categories/selectproduct/addtocart/makepayment/edit',userController.editorder)

router.get('/orderview', userController.getOrderView)

router.get('/orders/invoicedownload',userController.invoiceDownload)

router.get('/myprofile', userController.myProfile)

router.get('/myprofile/changepassword', userController.changePassword)

router.post('/myprofile/changepassword', userController.postPasswordChanged)

router.get('/myprofile/changeaddress', userController.changeAddress)

router.post('/myprofile/changeaddress', userController.postAddressChanged)

router.get('/myprofile/addaddress', userController.addAddress)

router.get('/myprofile/savechanges', upload.single('image'),userController.saveProfilePic)

router.get('/myprofile/logout', userController.profileLogout)

router.get('/wishlist', userController.getWishlist)

router.get('/categories/selectproduct/addtowishlist', userController.addToWishlist)

router.get('/wishlist/addtocart/:id', userController.wishlistAddtoCart)

router.get('/categories/selectproduct/addtowishlist/removeFromWishlist/:id', userController.removeFromWishlist)

router.get('/search/:searchtext',userController.productSearch)

router.post('/onlinePaypal',userController.online)

router.get('/success',userController.success)

router.get('/cancel',userController.cancel)

router.get('/applycoupon/couponcode',userController.applycoupon)

router.get('/userlogout',userController.userLogout)

router.get('/categories/selectproduct/addtocart/cartQtyMinus/:id', userController.cartQtyMinus)
             
router.get('/categories/selectproduct/addtocart/cartQtyPlus/:id', userController.cartQtyPlus)

router.get('/wheelspin', userController.wheelspin)

router.get("/applywheeldiscount/:discount",userController.applywheeldiscount)

module.exports=router