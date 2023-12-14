const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
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
  "/create-product",
  upload.single("image"),
  requireAuth,
  checkUser,
  productController.addProduct
);

router.get("/products/create", (req, res) => {
  res.render("create");
});

router.route("/products/:id").get(productController.getProduct);

router.route("/products/:id").delete(productController.deleteProduct);

router.route("/products/:id").put(productController.updateProduct);

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
