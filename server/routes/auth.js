const router = require('express').Router()
const { register, login, loginGoogle } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.post('/google', loginGoogle)

module.exports = router
