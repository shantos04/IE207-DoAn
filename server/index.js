require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const { connectDB } = require('./config/db')

const app = express()

// Allow multiple origins via comma-separated CORS_ORIGIN
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true) // allow same-origin or curl
            if (allowedOrigins.includes(origin)) return callback(null, true)
            return callback(new Error(`Not allowed by CORS: ${origin}`))
        },
        credentials: true,
    })
)
app.use(express.json())
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
