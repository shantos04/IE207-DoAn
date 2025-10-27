const jwt = require('jsonwebtoken')

function verify(req, res, next) {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Unauthorized' })
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
        req.user = payload
        next()
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' })
        }
        next()
    }
}

module.exports = { verify, requireRole }
