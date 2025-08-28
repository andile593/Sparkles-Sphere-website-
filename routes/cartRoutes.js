const express = require("express");
const {
  addToCart,
  updateCart,
  getCartData,
  removeCartData,
} = require("../controllers/cartController"); // only import what exists now

const router = express.Router();

// Display the cart (no login required)
router.get("/cart", getCartData);

// Add item to cart (no login required)
router.get("/cart/add-to-cart/:id", addToCart);

// Remove item from cart
router.get("/cart/remove/:id", removeCartData);

// Update quantity
router.post("/cart/update/:id", updateCart);

module.exports = router;
