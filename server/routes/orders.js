const router = require('express').Router()
const ctrl = require('../controllers/orderController')
const { verify } = require('../middleware/auth')

router.get('/', verify, ctrl.list)
router.get('/:id', verify, ctrl.get)
router.post('/', verify, ctrl.create)
router.put('/:id', verify, ctrl.update)
router.put('/:id/status', verify, ctrl.updateStatus)
router.delete('/:id', verify, ctrl.remove)

module.exports = router
