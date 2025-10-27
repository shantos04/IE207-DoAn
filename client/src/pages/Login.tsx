import type { FormEvent } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { login as loginApi } from '../services/auth'

export default function Login() {
    const [email, setEmail] = useState('admin@example.com')
    const [password, setPassword] = useState('admin123')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation() as any
    const from = location.state?.from?.pathname || '/'

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
                <p className="mt-4 text-center text-sm text-gray-600">
                    Chưa có tài khoản? <Link to="/register" className="text-primary-600 hover:underline">Đăng ký</Link>
                </p>
            </div>
        </div>
    )
}
