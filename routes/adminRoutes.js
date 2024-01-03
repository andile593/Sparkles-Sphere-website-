const express = require("express");
const {
  adminDashboard,
  markOrderAsDelivered
} = require("../controllers/productController");
const {
  requireAuth,
  checkUser,
  checkRole,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/admin/adminDashboard", adminDashboard);
router.post('/admin/markDelivered/:orderId', markOrderAsDelivered);





module.exports = router;
