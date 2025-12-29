import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../services/auth'

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
    const [errors, setErrors] = useState<{ [key: string]: string | string[] }>({})
    const navigate = useNavigate()

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
                <h1 className="text-xl font-semibold mb-6">Đăng ký tài khoản</h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Lỗi server */}
                    {errors.server && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600">
                            {errors.server}
                        </div>
                    )}

                    {/* Họ tên */}
                    <div>
                        <label htmlFor="name" className="block text-sm text-gray-700 mb-1">Họ tên *</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={e => {
                                setName(e.target.value)
                                validateField('name', e.target.value)
                            }}
                            placeholder="Nguyễn Văn A"
                            className={`w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.name ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Email *</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value)
                                validateField('email', e.target.value)
                            }}
                            placeholder="you@example.com"
                            className={`w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                            required
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Mật khẩu */}
                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-700 mb-1">Mật khẩu *</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value)
                                validateField('password', e.target.value)
                            }}
                            placeholder="••••••••"
                            className={`w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.password ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                            required
                        />
                        {errors.password && Array.isArray(errors.password) && (
                            <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                                {(errors.password as string[]).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        )}
                        {!errors.password && password && (
                            <p className="text-sm text-green-600 mt-1">✓ Mật khẩu hợp lệ</p>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-1">Xác nhận mật khẩu *</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                        )}
                        {confirmPassword && password === confirmPassword && (
                            <p className="text-sm text-green-600 mt-1">✓ Mật khẩu khớp</p>
                        )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={e => {
                                setPhone(e.target.value)
                                if (e.target.value) validateField('phone', e.target.value)
                            }}
                            placeholder="0912345678"
                            className={`w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.phone ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                        <label htmlFor="address" className="block text-sm text-gray-700 mb-1">Địa chỉ</label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="123 Đường ABC, Quận XYZ"
                            className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <button
                        disabled={loading || Object.keys(errors).length > 0}
                        className="w-full rounded bg-primary-600 text-white py-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Đã có tài khoản? <Link to="/login" className="text-primary-600 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    )
}
