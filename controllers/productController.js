const { mongoose } = require("mongoose");
const Product = require("../models/productModel");
const User = require("../models/userModel");

//get all products
const getProducts = async (req, res) => {

  const allProducts = await Product.find({}).sort({ createdAt: -1 })
  
  const bestSellingProducts = await Product.find({ category: 'Best-selling' }).sort({ createdAt: -1 })

  const homeProducts = await Product.find({ category: 'Home' }).sort({ createdAt: -1 })
  
  const carProducts = await Product.find({ category: 'Car-essentials' }).sort({ createdAt: -1 })
  console.log(req.user);
  
  res.render('products', { user: req.user, allProducts, bestSellingProducts, homeProducts, carProducts });

};

const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  // Fetch products based on the specified category
  const products = await Product.find({ category }).sort({ createdAt: -1 });

  res.render('products', { products });
};

//get a single Product
const getProduct = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Product doesn`t exist.' })
  }

  const product = await Product.findById(id)
   
  if(!product) {
    return res.status(404).json({ error: 'Product doesn`t exist.' })
  }

  res.render('product-detail', { product: product })

};

//create a product(Admin)
const addProduct = async (req, res) => {


  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Only admin can add products.' });
  }

  const { title, description, price, category  } = req.body;

  const image = req.file ? req.file.path : null;

  const products = await Product.create({ title, image, description, price, category  })
 
  res.redirect('/products')

};

// delete a product(Admin)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Product doesn`t exist.' })
  }

  const product = await Product.findOneAndDelete({_id: id})
   
  if(!product) {
    return res.status(404).json({ error: 'Product doesn`t exist.' })
  }

  res.status(200).json(product)
};

//update a product(Admin)

const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid identity" });
  }

  const product = await Product.findByIdAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!product) {
    return res.status(404).json({ error: "Product does not exist" });
  }

  res.status(200).json(product);
};

const adminDashboard = (req, res) => {
  // Only users with the 'admin' role can access this route
  res.render('adminDashboard');
};

module.exports = {
  getProduct,
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  getProductsByCategory
};
