const express = require('express')
const router = express.Router()
const { login, register, getProfile, updateProfile } = require('../controllers/user.controller');
const {authenticateToken} = require('../middlewares/authenticate.middleware')

router.patch('/update/profile', authenticateToken, updateProfile);
router.post('/register', register);
router.get('/profile',authenticateToken, getProfile);
router.post('/', login);

module.exports = router;