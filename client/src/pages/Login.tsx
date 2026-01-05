import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { login as loginApi, loginWithGoogle } from '../services/auth'

interface LoginProps {
    hasGoogleOAuth?: boolean
}

export default function Login({ hasGoogleOAuth = false }: LoginProps) {
    const [email, setEmail] = useState('admin@example.com')
    const [password, setPassword] = useState('admin123')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [googleClientId, setGoogleClientId] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation() as any
    const from = location.state?.from?.pathname || '/'

    useEffect(() => {
        // Check if Google OAuth is properly configured
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (clientId && !clientId.includes('YOUR_')) {
            setGoogleClientId(clientId)
        }
    }, [])

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await loginApi(email, password)
            localStorage.setItem('token', res.token)
            navigate(from, { replace: true })
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Đăng nhập thất bại')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async (credentialResponse: any) => {
        setError(null)
        setLoading(true)
        try {
            const res = await loginWithGoogle(credentialResponse.credential)
            localStorage.setItem('token', res.token)
            navigate(from, { replace: true })
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Đăng nhập Google thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Chào mừng đến với CRM.
                        </h1>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Đăng nhập để xem cập nhật mới nhất.
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Nhập thông tin của bạn để tiếp tục
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

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
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="john.doe@gmail.com"
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    required
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
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
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu..."
                                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    required
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>

                        {/* Remember me & Recover password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="remember" className="text-sm text-gray-700">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>
                            <Link to="#" className="text-sm text-primary-600 hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                            <Link
                                to="/register"
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                                Đăng ký
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
                                    onError={() => setError('Đăng nhập Google thất bại')}
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
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 items-center justify-center relative overflow-hidden">
                <div className="relative z-10 p-12">
                    <svg viewBox="0 0 400 400" className="w-full max-w-md">
                        {/* Tablet/Screen */}
                        <rect x="100" y="80" width="200" height="240" rx="12" fill="#E5E7EB" />
                        <rect x="110" y="90" width="180" height="220" rx="8" fill="#1F2937" />
                        
                        {/* Screen content */}
                        <rect x="130" y="110" width="140" height="8" rx="4" fill="#60A5FA" />
                        <rect x="130" y="125" width="100" height="8" rx="4" fill="#93C5FD" />
                        <rect x="130" y="140" width="120" height="8" rx="4" fill="#DBEAFE" />
                        
                        {/* Banner being pulled */}
                        <rect x="130" y="180" width="140" height="60" rx="4" fill="#FFFFFF" />
                        <circle cx="150" cy="200" r="8" fill="#F97316" />
                        <rect x="165" y="195" width="80" height="6" rx="3" fill="#E5E7EB" />
                        <rect x="165" y="205" width="60" height="6" rx="3" fill="#E5E7EB" />
                        
                        {/* Person */}
                        <ellipse cx="200" cy="360" rx="35" ry="45" fill="#1F2937" />
                        <circle cx="200" cy="320" r="30" fill="#374151" />
                        <rect x="180" y="340" width="15" height="50" rx="7" fill="#374151" transform="rotate(-25 187.5 365)" />
                        <rect x="205" y="340" width="15" height="50" rx="7" fill="#374151" transform="rotate(25 212.5 365)" />
                        
                        {/* Arms reaching up */}
                        <rect x="165" y="280" width="12" height="40" rx="6" fill="#3B82F6" transform="rotate(-20 171 300)" />
                        <rect x="223" y="280" width="12" height="40" rx="6" fill="#3B82F6" transform="rotate(20 229 300)" />
                    </svg>
                </div>

                {/* Background decorative elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-primary-400 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-primary-800 rounded-full opacity-20 blur-3xl"></div>
            </div>
        </div>
    )
}
