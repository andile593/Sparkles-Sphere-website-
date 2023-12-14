const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
     type: String,
   },
  title: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  productId: {
    type: String,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
