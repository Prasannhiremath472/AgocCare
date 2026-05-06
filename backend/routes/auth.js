const router = require('express').Router();
const { register, login, getMe, registerValidation } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', registerValidation, register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
