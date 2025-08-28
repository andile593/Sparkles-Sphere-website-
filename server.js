// server.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const config = require('./config');
const app = require('./app'); 

dotenv.config();

const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
mongoose.connect(config.databaseURL)
  .then(() => {
    app.listen(PORT, () => {
      console.log('connected to db & listening on port', PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
