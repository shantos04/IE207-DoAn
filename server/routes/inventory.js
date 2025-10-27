const router = require('express').Router()
const ctrl = require('../controllers/inventoryController')
const { verify } = require('../middleware/auth')

router.get('/', verify, ctrl.list)
router.post('/', verify, ctrl.create)
router.get('/low-stock', verify, ctrl.lowStock)

module.exports = router
