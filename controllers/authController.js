const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'green bear secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
 
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}


const sendResetEmail = async (email, resetToken) => {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'andilemhlanga16@gmail.com', // replace with your email
      pass: 'zbnn qzpu qmoc ndpq', // replace with your email password
    },
  });

  // Define the email content
  const mailOptions = {
    from: 'andilemhlanga16@gmail.com', // replace with your email
    to: email,
    subject: 'Password Reset',
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
      <p>Click the following link to reset your password:</p>
      <a href="http://www.greenbeartrading.co.za/reset-password/${resetToken}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};


module.exports.forgotPassword_get = (req, res) => {
  res.render('forgot-password');
};


module.exports.forgotPassword_post = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; 

      user.resetToken = resetToken;
      user.resetTokenExpires = resetTokenExpires;

      await user.save();

      await sendResetEmail(email, resetToken);

      res.json({ message: 'Check your email to complete resetting your password' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.resetPassword_get = (req, res) => {
  const token = req.params.token;

  res.render('reset-password', { token });
};


module.exports.resetPassword_post = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }, 
    });

    if (user) {
      
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpires = null;

      await user.save();

      // Redirect to the login page or a success page
      res.redirect('/login');
    } else {
      res.status(400).json({ error: 'Invalid or expired reset token' });
    }
  }  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};