const express = require("express");
const {
  addToCart,
  updateCart,
  getCartData,
  removeCartData,
} = require("../controllers/cartController"); // only import what exists now
const {
  requireAuth,
  checkUser,
  checkRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/cart", checkUser, getCartData);

router.post("/cart/add-to-cart/:id", addToCart);


router.post("/cart/remove/:id", removeCartData);

router.post("/cart/update/:id", updateCart);

module.exports = router;
