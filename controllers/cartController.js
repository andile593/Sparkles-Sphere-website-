const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");

const updateQuantityAndPrice = async (productId, newQuantity) => {
  // Find the product in the cart
  const cartItem = await Cart.findOne({ productId });

  if (!cartItem) {
    console.log(`Product with ID ${productId} not found in the cart`);
    return;
  }

  console.log(productId);
  console.log(newQuantity);
  console.log(cartItem);

  const updatedPrice = cartItem.price;

  // Update the quantity and calculate the new total price
  cartItem.quantity = newQuantity;
  cartItem.totalPrice = updatedPrice * newQuantity;

  // Save changes to the database
  await cartItem.save();

  console.log(`Updated quantity and price for product with ID ${productId}`);
};

const getCartData = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const cart = await Cart.find({ user: userId }).sort({ createdAt: -1 });

    console.log("the cart objects", cart);

    const totalCheckoutAmount = await calculateTotalCheckoutAmount(cart);

    res.render("cart", { carts: cart, totalCheckoutAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const calculateTotalCheckoutAmount = async (cart) => {
  try {
    if (!cart || !cart.length) {
      return 0; // Handle the case when the cart is empty or undefined
    }

    // Use Promise.all to asynchronously fetch product prices and calculate total amount
    const totalPricePromises = cart.map(async (cartItem) => {
      try {
        console.log("the cart items", cartItem);

        const product = await Product.findById(cartItem.productId);

        if (!product) {
          throw new Error(
            `Product not found for cart item with ID ${cartItem._id}`
          );
        }

        return product.price * cartItem.quantity;
      } catch (error) {
        console.error(
          `Error fetching product for cart item with ID ${cartItem._id}:`,
          error
        );
        throw error;
      }
    });

    const totalPrices = await Promise.all(totalPricePromises);

    const totalCheckoutAmount = totalPrices.reduce(
      (acc, totalPrice) => acc + totalPrice,
      0
    );

    return totalCheckoutAmount;
  } catch (error) {
    console.error("Error calculating total checkout amount:", error);
    throw error; // Propagate the error to the caller
  }
};

const addToCart = async (req, res) => {
  try {
    const prodId = req.params.id;

    const userId = req.user ? req.user._id.toString() : null;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    console.log("the users id", userId);

    const existingCartItem = await Cart.findOne({ productId: prodId, userId });

    if (existingCartItem) {
      // If the product exists, you might want to update its quantity instead of adding a new one
      existingCartItem.quantity += 1;
      existingCartItem.totalPrice =
        existingCartItem.quantity * existingCartItem.price;

      await existingCartItem.save();
    } else {
      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const cartItem = await Cart.create({
        title: product.title,
        price: product.price,
        image: product.image,
        productId: product.id,
        user: userId,
      });
    }

    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send("Internal Server Error");
  }
};

const updateCart = async (req, res) => {
  const { quantity } = req.body;

  try {
    const cart = await Cart.findById(req.params.id);

    if (!cart) {
      return res.status(400).json({ error: "No cart found with this id" });
    }

    const product = await Product.findById(cart.productId);

    if (!product) {
      return res
        .status(400)
        .json({ error: "No product found with the associated cart" });
    }

    const productPrice = product.price;

    cart.quantity = quantity;
    cart.totalPrice = productPrice * quantity;

    await cart.save();

    // Fetch the updated cart data from the database
    const updatedCart = await Cart.find({}).sort({ createdAt: -1 });

    const totalCheckoutAmount = await calculateTotalCheckoutAmount(updatedCart);
    const totalItems = updatedCart.length;

    res.json({ cart: updatedCart, totalCheckoutAmount, totalItems });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeCartData = async (req, res) => {
  const cartData = await Cart.findById(req.params.id);

  if (!cartData) {
    return res.status(400).json({ error: "Items not found" });
  }

  try {
    await cartData.remove();

    // Fetch the updated cart data after successful removal
    const updatedCart = await Cart.find({}).sort({ createdAt: -1 });

    const totalCheckoutAmount = await calculateTotalCheckoutAmount(updatedCart);
    const totalItems = updatedCart.length;

    // Respond with the updated data
    res.json({ totalCheckoutAmount, totalItems });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const postAddress = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user._id.toString();

    const order = await Order.findOne({ user: userId }).sort({ orderDate: -1 });
    const user = await User.findById(userId);

    user.shippingAddress = shippingAddress;
    order.shippingAddress = shippingAddress;

    await user.save();
    await order.save();

    const ordersDb = await Order.findOne({ user: userId }).sort({
      createdAt: -1,
    });
    console.log("the order", ordersDb);

    res.render("checkout-success", { order: order, user });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).send("Internal Server Error");
  }
};

const postOrder = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const existingOrder = await Order.findOne({ user: userId });

    console.log("the order already exists", existingOrder);
    // console.log("the cart already exists", existingCart);

    const existingCart = await Order.findOne({ user: userId });

    const updateTotalCheckoutAmount = await calculateTotalCheckoutAmount(
      existingCart
    );

    console.log(updateTotalCheckoutAmount);

    if (existingOrder) {
      return res.render("checkout-success", { order: existingOrder, user });
    }

    const cart = await Cart.find({ user: userId }).sort({ createdAt: -1 });

    const totalCheckoutAmount = await calculateTotalCheckoutAmount(cart);

    const order = await Order.create({
      user: userId,
      cart,
      totalCheckoutAmount,
      paymentStatus: "Pending", 
    });

    console.log(order);
    console.log(user);

    res.render("checkout-success", { order: order, user });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).send("Internal Server Error");
  }
};

const finalOrder = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const order = await Order.findOne({ user: userId }).sort({ orderDate: -1 });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "user does not exist" });
    }

    const arrayOfItems = order.cart;

    console.log("the order available", arrayOfItems);

    arrayOfItems.forEach((arrayOfItem) => {});

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "andilemhlanga16@gmail.com", // Replace with your Gmail email address
        pass: "zbnn qzpu qmoc ndpq",
      },
    });

    const customerMailOptions = {
      from: "andilemhlanga16@gmail.com",
      to: `${user.email}`, // Replace with the customer's email address
      subject: "Thank You for Your Purchase!",
      text: `Dear Customer,

    Thank you for your recent purchase from Green Bear Trading & Projects PTY LTD. We appreciate your business and hope you enjoy your new product.

    
    ${arrayOfItems
      .map(
        (item) => `
    Order Details:
    - Order ID: ${order.id} 
    - Product: ${item.title}
    - Quantity: ${item.quantity} 
    - Total Amount: R${order.totalCheckoutAmount} 
    `
      )
      .join("")}

    If you have any questions or concerns regarding your order, please don't hesitate to contact our customer support.

    Thank you again for choosing Green Bear Trading & Projects PTY LTD.

    Best regards,
    Green Bear Trading & Projects`,
      html: `<p>Dear Customer,</p>
      <p>Thank you for your recent purchase from Green Bear Trading & Projects. We appreciate your business and hope you enjoy your new product.</p>

      <div style="display: flex; flex-wrap: wrap;">
      ${arrayOfItems
        .map(
          (item) => `
          <div style="width: 50%; display: flex; flex-wrap: wrap;">
            <img style="width: 50px; height: 60px;" src='${item.image}' alt="${item.title}" />
            <div style="display: flex; flex-wrap: wrap;">
            <p style="width: 100%; "><strong>Product:</strong> ${item.title}</p>
            <p style="width: 100%; "><strong>Quantity:</strong> ${item.quantity}</p>
            </div>
          </div>
        `
        )
        .join("")}
        
    </div>
    <p style="width: 100%; "><strong>Amount:</strong> R ${order.totalCheckoutAmount}</p>

      <p>If you have any questions or concerns regarding your order, please don't hesitate to contact our customer support.</p>

      <p>Thank you again for choosing Green Bear Trading & Projects</p>

      <p>Best regards,<br>Green Bear Trading & Projects</p>`,
    };

    const companyMailOptions = {
      from: "andilemhlanga16@gmail.com", // owner email should be placed here
      to: `${user.email}`, // Replace with the customer's email address
      subject: "Thank You for Your Purchase!",
      text: `Dear Customer,

    Thank you for your recent purchase from Green Bear Trading & Projects PTY LTD. We appreciate your business and hope you enjoy your new product.

    
    ${arrayOfItems
      .map(
        (item) => `
    Order Details:
    - Order ID: ${order.id} 
    - Product: ${item.title}
    - Quantity: ${item.quantity} 
    - Total Amount: R${order.totalCheckoutAmount} 
    `
      )
      .join("")}

    If you have any questions or concerns regarding your order, please don't hesitate to contact our customer support.

    Thank you again for choosing Green Bear Trading & Projects PTY LTD.

    Best regards,
    Your Company Name Team`,
      html: `<p>Dear Customer,</p>
      <p>Thank you for your recent purchase from Your Company Name. We appreciate your business and hope you enjoy your new product.</p>

      <div style="display: flex; flex-wrap: wrap;">
      ${arrayOfItems
        .map(
          (item) => `
          <div style="width: 50%; display: flex; flex-wrap: wrap;">
            <img style="width: 50px; height: 60px;" src='${item.image}' alt="${item.title}" />
            <div style="display: flex; flex-wrap: wrap;">
            <p style="width: 100%; "><strong>Product:</strong> ${item.title}</p>
            <p style="width: 100%; "><strong>Quantity:</strong> ${item.quantity}</p>
            </div>
          </div>
        `
        )
        .join("")}
        
    </div>
    <p style="width: 100%; "><strong>Amount:</strong> R ${order.totalCheckoutAmount}</p>

      <p>If you have any questions or concerns regarding your order, please don't hesitate to contact our customer support.</p>

      <p>Thank you again for choosing Your Company Name.</p>

      <p>Best regards,<br>Your Company Name Team</p>`,
    };

    const customereInfo = await transporter.sendMail(customerMailOptions);
    // const companysInfo = await transporter.sendMail(companyMailOptions);

    res.render("success");
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  addToCart,
  updateCart,
  getCartData,
  removeCartData,
  postOrder,
  postAddress,
  finalOrder,
};
