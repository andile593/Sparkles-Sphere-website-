// orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: [
     {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      image: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  shippingAddress: {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    area: {
      type: String,
    },
    province: {
      type: String,
    },
    zip: {
      type: String,
    },
    country: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  totalCheckoutAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
