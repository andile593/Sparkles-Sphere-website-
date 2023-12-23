const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const {
  requireAuth,
  checkUser,
  checkRole,
} = require("../middleware/authMiddleware");

router
  .route("/products")
  .get(requireAuth, checkUser, productController.getProducts);

router.post(
  "/products/create",
  requireAuth,
  checkUser,
  productController.addProduct
);

router.get("/products/create", (req, res) => {
  res.render("create");
});

router.route("/product/:id").get(productController.getProduct);

router.get("/product/remove/:id", productController.deleteProduct);

router.get("/product/:id", productController.updateProduct);

router.get(
  "/products/category/:category",
  productController.getProductsByCategory
);

// router
//   .route("/admin/dashboard")
//   .get(
//     requireAuth,
//     checkUser,
//     checkRole("admin"),
//     productController.adminDashboard
//   );

module.exports = router;
