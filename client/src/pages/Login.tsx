import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { login as loginApi, loginWithGoogle, loginWithFacebook } from '../services/auth'

export default function Login() {
    const [email, setEmail] = useState('admin@example.com')
    const [password, setPassword] = useState('admin123')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation() as any
    const from = location.state?.from?.pathname || '/'

    useEffect(() => {
        // Load Facebook SDK
        if (!window.FB) {
            window.fbAsyncInit = function () {
                FB.init({
                    appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
                    xfbml: true,
                    version: 'v18.0'
                })
            }

            // Load the Facebook SDK script
            const script = document.createElement('script')
            script.async = true
            script.defer = true
            script.crossOrigin = 'anonymous'
            script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0'
            document.body.appendChild(script)
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

    const handleFacebookLogin = async (response: any) => {
        setError(null)
        setLoading(true)
        try {
            const res = await loginWithFacebook(response.accessToken, response.userID, response.name, response.email)
            localStorage.setItem('token', res.token)
            navigate(from, { replace: true })
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Đăng nhập Facebook thất bại')
        } finally {
            setLoading(false)
        }
    }

    const handleFacebookClick = () => {
        if (!window.FB) {
            setError('Facebook SDK chưa tải xong')
            return
        }

        FB.login((response: any) => {
            if (response.authResponse) {
                FB.api('/me', { fields: 'id,name,email' }, (userInfo: any) => {
                    handleFacebookLogin({
                        accessToken: response.authResponse.accessToken,
                        userID: userInfo.id,
                        name: userInfo.name,
                        email: userInfo.email
                    })
                })
            } else {
                setError('Đăng nhập Facebook bị hủy')
            }
        }, { scope: 'public_profile,email' })
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

                <div className="mx-auto w-2/3 space-y-3">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => setError('Đăng nhập Google thất bại')}
                        text="signin_with"
                    />

                    <button
                        type="button"
                        onClick={handleFacebookClick}
                        disabled={loading}
                        className="w-full rounded bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                        f Đăng nhập Facebook
                    </button>
                </div>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Chưa có tài khoản? <Link to="/register" className="text-primary-600 hover:underline">Đăng ký</Link>
                </p>
            </div>
        </div>
    )
}
