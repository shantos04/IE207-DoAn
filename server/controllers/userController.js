const User = require('../models/User')

// Get current user profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.sub).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (e) { next(e) }
}

// Update user profile (name, phone, address)
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address } = req.body
        const user = await User.findByIdAndUpdate(
            req.user.sub,
            { name, phone, address },
            { new: true, runValidators: true }
        ).select('-password')

        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (e) { next(e) }
}

// Change password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
        }

        const user = await User.findById(req.user.sub)
        if (!user) return res.status(404).json({ message: 'User not found' })

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' })
        }

        // Update password
        user.password = newPassword
        await user.save()

        res.json({ message: 'Đổi mật khẩu thành công' })
    } catch (e) { next(e) }
}

// Get user settings (notifications, preferences)
exports.getSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.sub).select('settings')
        if (!user) return res.status(404).json({ message: 'User not found' })

        // Return default settings if not exists
        const settings = user.settings || {
            notifications: {
                email: true,
                orderUpdates: true,
                promotions: false,
                newsletter: false
            },
            display: {
                theme: 'light',
                language: 'vi'
            },
            security: {
                twoFactorEnabled: false
            }
        }

        res.json(settings)
    } catch (e) { next(e) }
}

// Update user settings
exports.updateSettings = async (req, res, next) => {
    try {
        const { settings } = req.body

        const user = await User.findByIdAndUpdate(
            req.user.sub,
            { settings },
            { new: true, runValidators: true }
        ).select('settings')

        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user.settings)
    } catch (e) { next(e) }
}

// Get login history (mock data for now)
exports.getLoginHistory = async (req, res, next) => {
    try {
        // For now, return mock data
        // In production, you'd track this in a separate collection
        const history = [
            {
                id: 1,
                device: 'Chrome on Windows',
                location: 'Ho Chi Minh City, Vietnam',
                ip: '203.162.xxx.xxx',
                timestamp: new Date(Date.now() - 2 * 60 * 1000),
                current: true
            },
            {
                id: 2,
                device: 'Safari on iPhone',
                location: 'Ho Chi Minh City, Vietnam',
                ip: '203.162.xxx.xxx',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                current: false
            },
            {
                id: 3,
                device: 'Chrome on Windows',
                location: 'Ho Chi Minh City, Vietnam',
                ip: '203.162.xxx.xxx',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                current: false
            }
        ]

        res.json(history)
    } catch (e) { next(e) }
}
