// const express = require('express')
// const { getProducts, getProduct, addProduct, deleteProduct, updateProduct} = require('../controllers/productController')
// const { isAdmin, isUser } = require('../middleware/authMiddleware')
// const router = express.Router()


// router.get('/')

// //GET all products(Admin)
// router.get('/products',  getProducts)

// // GET a single product(Admin)
// router.get('/:id', getProduct)

// //Post new product under Admin
// router.route('/new', isAdmin).post( addProduct)

// // //Delete a product under Admin
// router.route('/:id', isAdmin).delete( deleteProduct)

// // //Update a product under Admin
// router.route('/:id', isAdmin ).put( updateProduct)


// module.exports = router