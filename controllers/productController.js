const { mongoose } = require("mongoose");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

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
    Drinks,
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
  product
    .save()
    .then((result) => {
      res.redirect("/products");
    })
    .catch((err) => {
      console.log(err);
    });
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

const adminDashboard = async (req, res) => {
  try {
    const customerOrders = await Order.find({}).sort({ createdAt: -1 });
    const customerProducts = await Product.find({}).sort({ createdAt: -1 });

    const ordersWithUser = [];

    for (const order of customerOrders) {
      const {
        user: [userId],
        ...restOfOrder
      } = order;


      const customer = await User.findById(userId);

      const orderWithUser = { ...restOfOrder, userEmail: customer.email };
      ordersWithUser.push(orderWithUser);
    }
    console.log('the customerOrder', ordersWithUser);
    res.render("adminDashboard", { customerOrders: ordersWithUser });

  } catch (error) {
    console.error("Error in adminDashboard:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const markOrderAsDelivered = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Assuming you have a 'delivered' field in your order schema
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { delivered: true });

    if (updatedOrder) {
      // Delete the order from the database
      await Order.findByIdAndDelete(orderId);

      res.status(200).json({ message: 'Order marked as delivered and deleted successfully' });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error marking order as delivered and deleting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getProduct,
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
  adminDashboard,
  markOrderAsDelivered,
};
