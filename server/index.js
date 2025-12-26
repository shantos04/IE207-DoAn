require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const { connectDB } = require('./config/db')

const app = express()

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production'

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without origin (same-origin, curl, etc)
            if (!origin) return callback(null, true)

            // In development, allow all localhost origins
            if (isDevelopment && origin.startsWith('http://localhost')) {
                return callback(null, true)
            }

            // In production, check whitelist
            if (!isDevelopment) {
                const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim())
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true)
                }
            }

            console.warn(`CORS blocked for origin: ${origin}`)
            return callback(new Error(`Not allowed by CORS: ${origin}`))
        },
        credentials: true,
    })
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
    res.json({ ok: true, ts: Date.now() })
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/suppliers', require('./routes/suppliers'))
app.use('/api/customers', require('./routes/customers'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/inventory', require('./routes/inventory'))
app.use('/api/reports', require('./routes/reports'))

app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 4000

async function start() {
    try {
        await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_parts')
        app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
    } catch (e) {
        console.error('Failed to start', e)
        process.exit(1)
    }
}

start()
