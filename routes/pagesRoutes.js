const express = require('express') 
const router = express.Router()
const Product = require('../models/productModel');

router.get('/', async (req, res) => {
  try {
    const newProducts = await Product.find({}).sort({ createdAt: -1 }).limit(4); // Or however many you want

    res.render('index', { user: req.user, newProducts }); // Send the products to index.ejs
  } catch (err) {
    console.error("Failed to load homepage:", err);
    res.status(500).send("Internal Server Error");
  }
})

router.get('/services', (req,res) => {
    res.render('services')
})


router.get('/about', (req,res) => {
    res.render('about')
})

router.get('/contact', (req,res) => {
    res.render('contact')
})

module.exports = router