// app.js
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const config = require("./config");
const productRoutes = require("./routes/productRoutes");
const pagesRoutes = require("./routes/pagesRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(cors({ origin: process.env.REMOTE_CLIENT_APP, credentials: true }));
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    parameterLimit: 100000,
    extended: false,
  })
);

app.use(
  bodyParser.json({
    limit: "5mb",
  })
);
app.use(cookieParser());

app.use("/", pagesRoutes);
app.use("/", productRoutes);
app.use("/", cartRoutes);
app.use("/", authRoutes);

module.exports = app;
