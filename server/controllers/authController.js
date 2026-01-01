const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Customer = require('../models/Customer')

function signToken(user) {
    return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
}

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body

        // Tạo user - luôn là customer khi đăng ký công khai
        const user = await User.create({ name, email, password, role: 'customer', phone, address })

        // Tự động tạo bản ghi Customer
        await Customer.create({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            customerType: 'individual',
            note: 'Tự đăng ký qua hệ thống'
        })

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
            // Tạo user mới với role customer
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
        // NOTE: Tạm comment kiểm tra role để test - sẽ bật lại sau
        // else {
        //     // Kiểm tra role - chỉ cho phép customer đăng nhập bằng OAuth
        //     if (user.role !== 'customer') {
        //         return res.status(403).json({
        //             message: 'Đăng nhập Google chỉ dành cho khách hàng. Vui lòng sử dụng email/mật khẩu để đăng nhập với tư cách quản trị viên.'
        //         })
        //     }
        // }

        const token = signToken(user)
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    } catch (e) { next(e) }
}
