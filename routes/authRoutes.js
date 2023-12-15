const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);

router.get('/forgot-password', authController.forgotPassword_get);

router.post('/forgot-password', authController.forgotPassword_post);

router.get('/reset-password/:token', authController.resetPassword_get);

router.post('/reset-password/:token', authController.resetPassword_post);

module.exports = router;
