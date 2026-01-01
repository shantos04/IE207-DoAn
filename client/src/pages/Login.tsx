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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
                <h1 className="text-xl font-semibold mb-6">Đăng nhập ERP</h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Email</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-700 mb-1">Mật khẩu</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button disabled={loading} className="w-full rounded bg-primary-600 text-white py-2 hover:bg-primary-700 disabled:opacity-50">
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="my-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Hoặc</span>
                        </div>
                    </div>
                </div>

                {googleClientId ? (
                    <div className="mx-auto w-2/3">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => setError('Đăng nhập Google thất bại')}
                            text="signin_with"
                        />
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
                        <p className="font-medium mb-1">🔧 Chức năng OAuth chưa được cấu hình</p>
                        <p className="text-xs">Vui lòng tham khảo file <code className="bg-amber-100 px-1">OAUTH_SETUP_GUIDE.md</code> để setup Google login</p>
                    </div>
                )}

                <p className="mt-4 text-center text-sm text-gray-600">
                    Chưa có tài khoản? <Link to="/register" className="text-primary-600 hover:underline">Đăng ký</Link>
                </p>
            </div>
        </div>
    )
}
