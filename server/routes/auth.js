const router = require('express').Router()
const { register, login, loginGoogle, loginFacebook } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.post('/google', loginGoogle)
router.post('/facebook', loginFacebook)

module.exports = router
