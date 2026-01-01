const router = require('express').Router()
const { verify } = require('../middleware/auth')
const ctrl = require('../controllers/userController')

// All routes require authentication
router.get('/profile', verify, ctrl.getProfile)
router.put('/profile', verify, ctrl.updateProfile)
router.post('/change-password', verify, ctrl.changePassword)
router.get('/settings', verify, ctrl.getSettings)
router.put('/settings', verify, ctrl.updateSettings)
router.get('/login-history', verify, ctrl.getLoginHistory)

module.exports = router
