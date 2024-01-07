const express = require("express");
const {
  addToCart,
  updateCart,
  getCartData,
  removeCartData,
  getCustomerOrders,
  postOrder,
  postAddress,
  finalOrder,
} = require("../controllers/cartController");
const { requireAuth, checkUser, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/cart", requireAuth, checkUser, getCartData);

router.get("/cart/add-to-cart/:id", requireAuth, checkUser, addToCart);
router.get("/checkout-order", requireAuth, checkUser, postOrder);

router.get("/cart/remove/:id", removeCartData);

router.post("/cart/update/:id", updateCart);
router.post("/submit-order", requireAuth, checkUser, postAddress);

router.get("/success", requireAuth, checkUser, finalOrder);
router.get('/orders', getCustomerOrders)

module.exports = router;
