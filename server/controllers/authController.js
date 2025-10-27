const jwt = require('jsonwebtoken')
const User = require('../models/User')

function signToken(user) {
    return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
}

exports.register = async (req, res, next) => {
    try {
        const user = await User.create(req.body)
        const token = signToken(user)
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    } catch (e) { next(e) }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'Sai thông tin đăng nhập' })
        const ok = await user.comparePassword(password)
        if (!ok) return res.status(401).json({ message: 'Sai thông tin đăng nhập' })
        const token = signToken(user)
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    } catch (e) { next(e) }
}
