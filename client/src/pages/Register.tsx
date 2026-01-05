import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { register as registerApi, loginWithGoogle } from '../services/auth'
import { User, Mail, Lock } from 'lucide-react'

// Validation utilities
const validators = {
    email: (email: string): string | null => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return 'Email không đúng định dạng user@example.com'
        }
        return null
    },
    password: (password: string): string[] => {
        const errors: string[] = []
        if (password.length < 6) {
            errors.push('Mật khẩu phải có ít nhất 6 ký tự')
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Mật khẩu phải chứa ít nhất 1 chữ số (0-9)')
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa (A-Z)')
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái viết thường (a-z)')
        }
        return errors
    },
    phone: (phone: string): string | null => {
        if (phone && !/^[0-9]{10,}$/.test(phone.replace(/\s/g, ''))) {
            return 'Số điện thoại phải có ít nhất 10 chữ số'
        }
        return null
    },
    name: (name: string): string | null => {
        if (name.trim().length < 3) {
            return 'Họ tên phải có ít nhất 3 ký tự'
        }
        return null
    }
}

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({})
    const [googleClientId, setGoogleClientId] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if Google OAuth is properly configured
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (clientId && !clientId.includes('YOUR_')) {
            setGoogleClientId(clientId)
        }
    }, [])

    const handleGoogleLogin = async (credentialResponse: any) => {
        setErrors({})
        setLoading(true)
        try {
            const res = await loginWithGoogle(credentialResponse.credential)
            localStorage.setItem('token', res.token)
            navigate('/', { replace: true })
        } catch (err: any) {
            setErrors({
                server: err?.response?.data?.message ?? err?.message ?? 'Đăng nhập Google thất bại'
            })
        } finally {
            setLoading(false)
        }
    }

    // Validate real-time khi user nhập
    const validateField = (fieldName: string, value: string) => {
        let error = null

        if (fieldName === 'name') {
            error = validators.name(value)
        } else if (fieldName === 'email') {
            error = validators.email(value)
        } else if (fieldName === 'password') {
            error = validators.password(value).length > 0 ? validators.password(value) : null
        } else if (fieldName === 'phone') {
            error = validators.phone(value)
        }

        if (error) {
            setErrors(prev => ({ ...prev, [fieldName]: error }))
        } else {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Validate all fields
        const newErrors: { [key: string]: string | string[] } = {}

        // Validate name
        const nameError = validators.name(name)
        if (nameError) newErrors.name = nameError

        // Validate email
        const emailError = validators.email(email)
        if (emailError) newErrors.email = emailError

        // Validate password
        const passwordErrors = validators.password(password)
        if (passwordErrors.length > 0) newErrors.password = passwordErrors

        // Validate confirm password
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
        }

        // Validate phone
        if (phone) {
            const phoneError = validators.phone(phone)
            if (phoneError) newErrors.phone = phoneError
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)
        try {
            const payload = {
                name,
                email,
                password,
                phone,
                address
            }

            const res = await registerApi(payload)
            localStorage.setItem('token', res.token)
            navigate('/', { replace: true })
        } catch (err: any) {
            setErrors({
                server: err?.response?.data?.message ?? err?.message ?? 'Đăng ký thất bại'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Chào mừng đến với CRM.
                        </h1>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Đăng ký để bắt đầu.
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Nhập thông tin của bạn để tiếp tục
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Lỗi server */}
                        {errors.server && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                                {errors.server}
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm text-gray-600 mb-2">
                                Họ và tên
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={e => {
                                        setName(e.target.value)
                                        validateField('name', e.target.value)
                                    }}
                                    placeholder="Nguyễn Văn A"
                                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    required
                                />
                                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => {
                                        setEmail(e.target.value)
                                        validateField('email', e.target.value)
                                    }}
                                    placeholder="support@example.com"
                                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    required
                                />
                                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm text-gray-600 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value)
                                        validateField('password', e.target.value)
                                    }}
                                    placeholder="Nhập mật khẩu..."
                                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    required
                                />
                                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                            {errors.password && Array.isArray(errors.password) && (
                                <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                                    {(errors.password as string[]).map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={e => setAgreeTerms(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                                Tôi đồng ý với điều khoản và điều kiện
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={loading || !agreeTerms}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                            <Link
                                to="/login"
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    </form>

                    {/* Social Sign In - Only Google */}
                    <div className="mt-8">
                        <p className="text-center text-sm text-gray-500 mb-4">
                            Hoặc đăng nhập bằng
                        </p>
                        {googleClientId ? (
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleLogin}
                                    onError={() => setErrors({ server: 'Đăng nhập Google thất bại' })}
                                    text="signin_with"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    disabled
                                    className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 items-center justify-center relative overflow-hidden">
                <div className="relative z-10 p-12">
                    <svg viewBox="0 0 400 400" className="w-full max-w-md">
                        {/* Computer screen */}
                        <rect x="80" y="120" width="240" height="160" rx="8" fill="#4B5563" />
                        <rect x="90" y="130" width="220" height="140" fill="#374151" />

                        {/* Screen content */}
                        <rect x="110" y="150" width="80" height="8" rx="4" fill="#60A5FA" />
                        <rect x="110" y="165" width="100" height="8" rx="4" fill="#93C5FD" />
                        <rect x="110" y="180" width="60" height="8" rx="4" fill="#DBEAFE" />

                        <rect x="220" y="150" width="70" height="60" rx="8" fill="#3B82F6" />

                        {/* Person */}
                        <ellipse cx="200" cy="320" rx="30" ry="40" fill="#374151" />
                        <circle cx="200" cy="280" r="25" fill="#4B5563" />
                        <path d="M200 280 Q 210 270 220 280" fill="#F87171" />

                        {/* Arms */}
                        <rect x="170" y="300" width="15" height="60" rx="7" fill="#4B5563" transform="rotate(-20 177.5 330)" />
                        <rect x="215" y="300" width="15" height="60" rx="7" fill="#4B5563" transform="rotate(20 222.5 330)" />

                        {/* Laptop in hand */}
                        <rect x="240" y="340" width="60" height="40" rx="4" fill="#60A5FA" transform="rotate(15 270 360)" />

                        {/* Desk */}
                        <rect x="100" y="360" width="200" height="8" rx="4" fill="#1F2937" />

                        {/* Decorative circles */}
                        <circle cx="320" cy="100" r="40" fill="#3B82F6" opacity="0.3" />
                        <circle cx="80" cy="350" r="50" fill="#1E40AF" opacity="0.3" />
                    </svg>
                </div>

                {/* Background decorative elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-800 rounded-full opacity-20 blur-3xl"></div>
            </div>
        </div>
    )
}
