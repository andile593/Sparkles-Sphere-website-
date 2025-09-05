const Product = require("../models/productModel");

// Add or update cart item
const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!req.session.cart) req.session.cart = [];

    const existingItem = req.session.cart.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) existingItem.quantity += 1;
    else req.session.cart.push({ productId, quantity: 1 });

    req.session.save(err => {
      if (err) return res.status(500).json({ message: "Failed to save cart" });
      res.json({ cart: req.session.cart });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get cart page
const getCartData = async (req, res) => {
  try {
    if (!req.session.cart) req.session.cart = [];
    const cartItems = [];
    let totalCheckoutAmount = 0;

    for (const item of req.session.cart) {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          _id: product._id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: item.quantity
        });
        totalCheckoutAmount += product.price * item.quantity;
      }
    }

    res.render("cart", { carts: cartItems, totalCheckoutAmount });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while loading cart");
  }
};

// Update quantity
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!req.session.cart) req.session.cart = [];
    const item = req.session.cart.find(i => i.productId.toString() === id);
    if (item) item.quantity = parseInt(quantity) || 1;

    let totalCheckoutAmount = 0;
    for (const cartItem of req.session.cart) {
      const product = await Product.findById(cartItem.productId);
      if (product) totalCheckoutAmount += product.price * cartItem.quantity;
    }

    const totalItems = req.session.cart.reduce((sum, i) => sum + i.quantity, 0);

    req.session.save(err => {
      if (err) return res.status(500).json({ message: "Failed to update cart" });
      res.json({ cart: item, totalCheckoutAmount, totalItems });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Remove item
const removeCartData = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.session.cart) req.session.cart = [];

    req.session.cart = req.session.cart.filter(
      item => item.productId.toString() !== id
    );

    let totalCheckoutAmount = 0;
    for (const cartItem of req.session.cart) {
      const product = await Product.findById(cartItem.productId);
      if (product) totalCheckoutAmount += product.price * cartItem.quantity;
    }

    const totalItems = req.session.cart.reduce((sum, i) => sum + i.quantity, 0);

    req.session.save(err => {
      if (err) return res.status(500).json({ message: "Failed to remove item" });
      res.json({ totalCheckoutAmount, totalItems });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { addToCart, getCartData, updateCart, removeCartData };
