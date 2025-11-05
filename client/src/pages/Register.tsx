import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../services/auth'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [accountType, setAccountType] = useState<'customer' | 'staff'>('customer')
    const [role, setRole] = useState<'admin' | 'sales' | 'warehouse'>('sales')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        setLoading(true)
        try {
            const payload: any = { name, email, password }

            if (accountType === 'customer') {
                payload.role = 'customer'
                payload.phone = phone
                payload.address = address
            } else {
                payload.role = role
            }

            const res = await registerApi(payload)
            localStorage.setItem('token', res.token)
            navigate('/', { replace: true })
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Đăng ký thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
                <h1 className="text-xl font-semibold mb-6">Đăng ký tài khoản</h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm text-gray-700 mb-1">Họ tên</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>
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
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-1">Xác nhận mật khẩu</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" required />
                    </div>

                    <div>
                        <label htmlFor="accountType" className="block text-sm text-gray-700 mb-1">Loại tài khoản</label>
                        <select id="accountType" value={accountType} onChange={e => setAccountType(e.target.value as any)}
                            className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500">
                            <option value="customer">Khách hàng (mua hàng)</option>
                            <option value="staff">Nhân viên nội bộ</option>
                        </select>
                    </div>

                    {accountType === 'customer' && (
                        <>
                            <div>
                                <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                                <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                    placeholder="0912345678"
                                    className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm text-gray-700 mb-1">Địa chỉ</label>
                                <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)}
                                    placeholder="123 Đường ABC, Quận XYZ"
                                    className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                        </>
                    )}

                    {accountType === 'staff' && (
                        <div>
                            <label htmlFor="role" className="block text-sm text-gray-700 mb-1">Vai trò</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value as any)}
                                className="w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500">
                                <option value="sales">Nhân viên bán hàng</option>
                                <option value="warehouse">Nhân viên kho</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button disabled={loading} className="w-full rounded bg-primary-600 text-white py-2 hover:bg-primary-700 disabled:opacity-50">
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
