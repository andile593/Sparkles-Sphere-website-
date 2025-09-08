const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!req.session.cart) req.session.cart = [];
    let sessionItem = req.session.cart.find(item => item.productId.toString() === productId);

    if (sessionItem) {
      sessionItem.quantity += 1;
    } else {
      sessionItem = {
        productId,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      };
      req.session.cart.push(sessionItem);
    }

    let cartItem;
    if (req.user) {
      cartItem = await Cart.findOne({ user: req.user._id, productId });

      if (cartItem) {
        cartItem.quantity += 1;
        cartItem.totalPrice = cartItem.price * cartItem.quantity;
        await cartItem.save();
      } else {
        cartItem = new Cart({
          user: req.user._id,
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
          totalPrice: product.price,
        });
        await cartItem.save();
      }
    }

    req.session.save(err => {
      if (err) return res.status(500).json({ message: "Failed to save cart" });
      res.json({
        sessionCart: req.session.cart,
        dbCart: cartItem || null,
        message: "Product added to cart",
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getCartData = async (req, res) => {
  try {
    let cartItems = [];
    let totalCheckoutAmount = 0;

    if (req.user) {
      
      cartItems = await Cart.find({ user: req.user._id });
      totalCheckoutAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

     
      req.session.cart = cartItems.map(item => ({
        productId: item.productId.toString(),
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      }));
      req.session.save();
    } else {
    
      if (!req.session.cart) req.session.cart = [];

      for (const item of req.session.cart) {
        const product = await Product.findById(item.productId);
        if (product) {
          cartItems.push({
            _id: product._id,
            title: product.title,
            image: product.image,
            price: product.price,
            quantity: item.quantity,
            totalPrice: product.price * item.quantity
          });
          totalCheckoutAmount += product.price * item.quantity;
        }
      }
    }

    res.render("cart", { carts: cartItems, totalCheckoutAmount });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while loading cart");
  }
};



const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!req.session.cart) req.session.cart = [];
    const item = req.session.cart.find(i => i.productId.toString() === id);
    if (item) item.quantity = parseInt(quantity) || 1;

    let totalCheckoutAmount = 0;
    for (const cartItem of req.session.cart) {
      const product = await Product.findById(cartItem.productId);
      if (product) totalCheckoutAmount += product.price * cartItem.quantity;
    }

    const totalItems = req.session.cart.reduce((sum, i) => sum + i.quantity, 0);

    req.session.save(err => {
      if (err) return res.status(500).json({ message: "Failed to update cart" });
      res.json({ cart: item, totalCheckoutAmount, totalItems });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Remove item
const removeCartData = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.session.cart) req.session.cart = [];

    req.session.cart = req.session.cart.filter(
      item => item.productId.toString() !== id
    );

    let totalCheckoutAmount = 0;
    for (const cartItem of req.session.cart) {
      const product = await Product.findById(cartItem.productId);
      if (product) totalCheckoutAmount += product.price * cartItem.quantity;
    }

    const totalItems = req.session.cart.reduce((sum, i) => sum + i.quantity, 0);

    req.session.save(err => {
      if (err) return res.status(500).json({ message: "Failed to remove item" });
      res.json({ totalCheckoutAmount, totalItems });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { addToCart, getCartData, updateCart, removeCartData };
