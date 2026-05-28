const express = require('express')
const authController = require('../controller/authController.js')
const userAuth = require('../middleware/userAuth.js')

const router = express.Router();


router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/send-verify-otp', userAuth, authController.verifyOtp)
router.post('/verify-email', userAuth, authController.verifyEmail)
router.post('/is-auth', userAuth, authController.isAuthenticated)
router.post('/sent-reset-otp', userAuth, authController.sendResetOtp)
router.post('/reset-password', userAuth, authController.resetPassword)
router.get('/data', userAuth, authController.getUserData)


module.exports = router;