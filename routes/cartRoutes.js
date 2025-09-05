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

router.post("/cart/add-to-cart/:id", addToCart);


router.post("/cart/remove/:id", removeCartData);

router.post("/cart/update/:id", updateCart);

module.exports = router;
