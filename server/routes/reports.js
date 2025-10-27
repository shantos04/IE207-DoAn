const router = require('express').Router()
const ctrl = require('../controllers/reportController')
const { verify } = require('../middleware/auth')

router.get('/dashboard', verify, ctrl.dashboard)
router.get('/sales', verify, ctrl.salesReport)
router.get('/inventory', verify, ctrl.inventoryReport)

module.exports = router
