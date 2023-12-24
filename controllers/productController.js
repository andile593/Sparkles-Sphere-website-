const { mongoose } = require("mongoose");
const Product = require("../models/productModel");
const User = require("../models/userModel");

//get all products
const getProducts = async (req, res) => {
  const allProducts = await Product.find({}).sort({ createdAt: -1 });

  const bestSellingProducts = await Product.find({
    category: "Best-selling",
  }).sort({ createdAt: -1 });

  const homeProducts = await Product.find({ category: "Home" }).sort({
    createdAt: -1,
  });

  const carProducts = await Product.find({ category: "Car-essentials" }).sort({
    createdAt: -1,
  });

  const Drinks = await Product.find({ category: "Drinks" }).sort({
    createdAt: -1,
  });

  res.render("products", {
    user: req.user,
    allProducts,
    bestSellingProducts,
    homeProducts,
    carProducts,
    Drinks
  });
};

const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  // Fetch products based on the specified category
  const products = await Product.find({ category }).sort({ createdAt: -1 });

  res.render("products", { products });
};

//get a single Product
const getProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Product doesn`t exist." });
  }

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ error: "Product doesn`t exist." });
  }

  res.render("product-detail", { product: product });
};

//create a product(Admin)
const addProduct = async (req, res) => {


  const product = new Product(req.body);
  product.save()
    .then(result => {
      res.redirect('/products');
    })
    .catch(err => {
      console.log(err);
    });

  // if (req.user.role !== "admin") {
  //   return res
  //     .status(403)
  //     .json({ error: "Unauthorized. Only admin can add products." });
  // }

  // const { title, description, price, category } = req.body;

  // const image = req.file ? req.file.path : null;

  // const products = await Product.create({
  //   title,
  //   image,
  //   description,
  //   price,
  //   category,
  // });

  // res.redirect("/products");
};

// delete a product(Admin)
const deleteProduct = async (req, res) => {
  const productData = await Product.findById(req.params.id);

console.log();
  if (!productData) {
    return res.status(400).json({ error: "Items not found" });
  }

  try {
    await productData.remove();

    res.redirect("/products");
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
  res.render("adminDashboard");
};

module.exports = {
  getProduct,
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
};
