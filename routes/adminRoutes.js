const express = require("express");
const {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const {
  requireAuth,
  checkUser,
  checkRole,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/admin");

//GET all products(Admin)
router.get("/admin/products", getProducts);

// GET a single product(Admin)
router.get("/admin/product/:id", getProduct);

//Post new product under Admin

router.post(
  "/admin/create-product",
  requireAuth,
  checkUser,
  addProduct
);

router.get("/products/create", (req, res) => {
  res.render("create");
});

// //Delete a product under Admin
router.route("/admin/product/:id", requireAuth, checkUser, checkRole).delete(deleteProduct);

// //Update a product under Admin
router.route("/admin/product/:id", requireAuth, checkUser, checkRole).put(updateProduct);

module.exports = router;
