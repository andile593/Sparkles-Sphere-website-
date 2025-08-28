// controllers/cartController.js
const Product = require("../models/productModel");

/**
 * 🛒 Add product to cart
 */
const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;

    // Ensure product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Init cart if missing
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Check if already exists
    const existingItem = req.session.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      req.session.cart.push({ productId, quantity: 1 });
    }

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Failed to save cart" });
      }
      return res.json({ message: "Product added to cart", cart: req.session.cart });
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * 📦 Get cart and render cart page
 */
const getCartData = async (req, res) => {
  try {
    if (!req.session.cart) {
      req.session.cart = [];
    }

    const cartItems = [];
    for (const item of req.session.cart) {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          _id: product._id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
        });
      }
    }

    const totalCheckoutAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.render("cart", { carts: cartItems, totalCheckoutAmount });
  } catch (err) {
    console.error("Error fetching cart data:", err);
    res.status(500).send("Something went wrong while loading cart");
  }
};

/**
 * ✏️ Update quantity of cart item
 */
const updateCart = (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const item = req.session.cart.find((i) => i.productId.toString() === id);
    if (item) {
      item.quantity = parseInt(quantity) || 1;
    }

    const totalCheckoutAmount = req.session.cart.reduce(
      (sum, i) => sum + i.quantity * 1, // placeholder until we fetch product price
      0
    );

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Failed to update cart" });
      }
      return res.json({ cart: item, totalCheckoutAmount });
    });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * ❌ Remove item from cart
 */
const removeCartData = (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session.cart) {
      req.session.cart = [];
    }

    req.session.cart = req.session.cart.filter(
      (item) => item.productId.toString() !== id
    );

    const totalCheckoutAmount = req.session.cart.reduce(
      (sum, i) => sum + i.quantity * 1, // placeholder until fetch product
      0
    );

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Failed to remove item" });
      }
      return res.json({ message: "Item removed", totalCheckoutAmount });
    });
  } catch (err) {
    console.error("Error removing cart item:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  addToCart,
  getCartData,
  updateCart,
  removeCartData,
};
