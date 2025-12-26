const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Customer = require('../models/Customer')

function signToken(user) {
    return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
}

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone, address } = req.body

        // Tạo user
        const user = await User.create({ name, email, password, role: role || 'customer', phone, address })

        // Nếu là customer, tự động tạo bản ghi Customer
        if (user.role === 'customer') {
            await Customer.create({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                note: 'Tự đăng ký qua hệ thống'
            })
        }

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

exports.loginGoogle = async (req, res, next) => {
    try {
        const { credential } = req.body

        // Decode JWT từ Google
        const decoded = jwt.decode(credential)
        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Invalid Google token' })
        }

        // Tìm hoặc tạo user
        let user = await User.findOne({ email: decoded.email })
        if (!user) {
            user = await User.create({
                name: decoded.name || 'User',
                email: decoded.email,
                password: Math.random().toString(36).substring(7), // Random password for OAuth users
                role: 'customer'
            })

            // Tạo customer record
            await Customer.create({
                name: user.name,
                email: user.email,
                phone: '',
                address: '',
                note: 'Đăng ký qua Google'
            })
        }

        const token = signToken(user)
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    } catch (e) { next(e) }
}

exports.loginFacebook = async (req, res, next) => {
    try {
        const { userID, name, email, accessToken } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email not provided by Facebook' })
        }

        // Tìm hoặc tạo user
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                name: name || 'User',
                email: email,
                password: Math.random().toString(36).substring(7), // Random password for OAuth users
                role: 'customer'
            })

            // Tạo customer record
            await Customer.create({
                name: user.name,
                email: user.email,
                phone: '',
                address: '',
                note: 'Đăng ký qua Facebook'
            })
        }

        const token = signToken(user)
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    } catch (e) { next(e) }
}
