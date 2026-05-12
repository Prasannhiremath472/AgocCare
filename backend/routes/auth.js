const router = require('express').Router();
const { register, registerValidation, loginSendOTP, loginVerifyOTP, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register',          registerValidation, register);
router.post('/login/send-otp',    loginSendOTP);
router.post('/login/verify-otp',  loginVerifyOTP);
router.get('/me',                 auth, getMe);

module.exports = router;
