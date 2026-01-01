const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'sales', 'warehouse', 'customer'], default: 'customer' },
        active: { type: Boolean, default: true },
        phone: { type: String },
        address: { type: String },
        settings: {
            notifications: {
                email: { type: Boolean, default: true },
                orderUpdates: { type: Boolean, default: true },
                promotions: { type: Boolean, default: false },
                newsletter: { type: Boolean, default: false }
            },
            display: {
                theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
                language: { type: String, enum: ['vi', 'en'], default: 'vi' }
            },
            security: {
                twoFactorEnabled: { type: Boolean, default: false }
            }
        }
    },
    { timestamps: true }
)

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password)
}

module.exports = mongoose.model('User', userSchema)
