import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    getProfile,
    updateProfile,
    changePassword,
    getSettings,
    updateSettings,
    getLoginHistory,
    type UserProfile,
    type UserSettings,
    type LoginHistory
} from '../services/users'

type Tab = 'profile' | 'password' | 'notifications' | 'display' | 'security'

export default function Settings() {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const navigate = useNavigate()

    // Profile state
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' })

    // Password state
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

    // Settings state
    const [settings, setSettings] = useState<UserSettings | null>(null)

    // Login history state
    const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])

    useEffect(() => {
        loadProfile()
        loadSettings()
        loadLoginHistory()
    }, [])

    const loadProfile = async () => {
        try {
            const data = await getProfile()
            setProfile(data)
            setProfileForm({
                name: data.name,
                phone: data.phone || '',
                address: data.address || ''
            })
        } catch (error: any) {
            console.error('Failed to load profile:', error)
        }
    }

    const loadSettings = async () => {
        try {
            const data = await getSettings()
            setSettings(data)
        } catch (error: any) {
            console.error('Failed to load settings:', error)
        }
    }

    const loadLoginHistory = async () => {
        try {
            const data = await getLoginHistory()
            setLoginHistory(data)
        } catch (error: any) {
            console.error('Failed to load login history:', error)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        try {
            await updateProfile(profileForm)
            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
            loadProfile()
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Cập nhật thất bại' })
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới không khớp' })
            setLoading(false)
            return
        }

        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
            setLoading(false)
            return
        }

        try {
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Đổi mật khẩu thất bại' })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateSettings = async (newSettings: UserSettings) => {
        setLoading(true)
        setMessage(null)
        try {
            await updateSettings(newSettings)
            setSettings(newSettings)
            setMessage({ type: 'success', text: 'Cập nhật cài đặt thành công!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Cập nhật thất bại' })
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
        { id: 'password', label: 'Đổi mật khẩu', icon: '🔒' },
        { id: 'notifications', label: 'Thông báo', icon: '🔔' },
        { id: 'display', label: 'Hiển thị', icon: '🎨' },
        { id: 'security', label: 'Bảo mật', icon: '🛡️' }
    ]

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Navbar */}
            <div className="sticky top-0 z-40 backdrop-blur bg-white/90 border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                        <Link to="/shop" className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Tech Store</p>
                                <h1 className="text-xl font-bold text-gray-900">Cài đặt tài khoản</h1>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Link
                            to="/shop"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 bg-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Cửa hàng
                        </Link>
                        <Link
                            to="/my-orders"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 bg-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Đơn hàng
                        </Link>
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:border-indigo-300"
                                title="Tài khoản"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="hidden sm:inline">{profile?.name || 'Tài khoản'}</span>
                            </button>
                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                                    onMouseLeave={() => setShowUserMenu(false)}
                                >
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <p className="text-sm font-semibold text-gray-900">{profile?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                                    </div>
                                    <Link
                                        to="/shop"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <span className="text-sm text-gray-700">Cửa hàng</span>
                                    </Link>
                                    <Link
                                        to="/my-orders"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-700">Đơn hàng của tôi</span>
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors bg-indigo-50 border-l-4 border-indigo-600"
                                    >
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm text-indigo-700 font-semibold">Cài đặt</span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t w-full text-left"
                                    >
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="text-sm text-red-600 font-semibold">Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Cài đặt tài khoản</h2>
                        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm của bạn</p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as Tab)
                                        setMessage(null)
                                    }}
                                    className={`
                                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                ${activeTab === tab.id
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                            `}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg border p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="max-w-2xl">
                                <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            className="w-full rounded-lg border-gray-300 bg-gray-50"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="0901234567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ
                                        </label>
                                        <textarea
                                            value={profileForm.address}
                                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                            rows={3}
                                            placeholder="Nhập địa chỉ của bạn"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                                        >
                                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div className="max-w-2xl">
                                <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mật khẩu mới <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                            minLength={6}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                                        >
                                            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && settings && (
                            <div className="max-w-2xl">
                                <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b">
                                        <div>
                                            <p className="font-medium">Thông báo qua Email</p>
                                            <p className="text-sm text-gray-500">Nhận thông báo qua email của bạn</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.email}
                                                onChange={(e) => {
                                                    const newSettings = {
                                                        ...settings,
                                                        notifications: { ...settings.notifications, email: e.target.checked }
                                                    }
                                                    handleUpdateSettings(newSettings)
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b">
                                        <div>
                                            <p className="font-medium">Cập nhật đơn hàng</p>
                                            <p className="text-sm text-gray-500">Nhận thông báo khi đơn hàng có cập nhật</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.orderUpdates}
                                                onChange={(e) => {
                                                    const newSettings = {
                                                        ...settings,
                                                        notifications: { ...settings.notifications, orderUpdates: e.target.checked }
                                                    }
                                                    handleUpdateSettings(newSettings)
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b">
                                        <div>
                                            <p className="font-medium">Khuyến mãi & Ưu đãi</p>
                                            <p className="text-sm text-gray-500">Nhận thông báo về các chương trình khuyến mãi</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.promotions}
                                                onChange={(e) => {
                                                    const newSettings = {
                                                        ...settings,
                                                        notifications: { ...settings.notifications, promotions: e.target.checked }
                                                    }
                                                    handleUpdateSettings(newSettings)
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium">Bản tin</p>
                                            <p className="text-sm text-gray-500">Nhận bản tin định kỳ từ chúng tôi</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.newsletter}
                                                onChange={(e) => {
                                                    const newSettings = {
                                                        ...settings,
                                                        notifications: { ...settings.notifications, newsletter: e.target.checked }
                                                    }
                                                    handleUpdateSettings(newSettings)
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Display Tab */}
                        {activeTab === 'display' && settings && (
                            <div className="max-w-2xl">
                                <h3 className="text-lg font-semibold mb-4">Cài đặt hiển thị</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Giao diện</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {(['light', 'dark', 'auto'] as const).map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => {
                                                        const newSettings = {
                                                            ...settings,
                                                            display: { ...settings.display, theme }
                                                        }
                                                        handleUpdateSettings(newSettings)
                                                    }}
                                                    className={`
                                                p-4 rounded-lg border-2 transition-all
                                                ${settings.display.theme === theme
                                                            ? 'border-primary-500 bg-primary-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }
                                            `}
                                                >
                                                    <div className="text-2xl mb-2">
                                                        {theme === 'light' && '☀️'}
                                                        {theme === 'dark' && '🌙'}
                                                        {theme === 'auto' && '⚡'}
                                                    </div>
                                                    <div className="font-medium">
                                                        {theme === 'light' && 'Sáng'}
                                                        {theme === 'dark' && 'Tối'}
                                                        {theme === 'auto' && 'Tự động'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {settings.display.theme === 'auto' && 'Giao diện sẽ tự động thay đổi theo cài đặt hệ thống'}
                                            {settings.display.theme === 'dark' && 'Hiện tại chỉ hỗ trợ giao diện sáng'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Ngôn ngữ</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(['vi', 'en'] as const).map((lang) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => {
                                                        const newSettings = {
                                                            ...settings,
                                                            display: { ...settings.display, language: lang }
                                                        }
                                                        handleUpdateSettings(newSettings)
                                                    }}
                                                    className={`
                                                p-4 rounded-lg border-2 transition-all
                                                ${settings.display.language === lang
                                                            ? 'border-primary-500 bg-primary-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }
                                            `}
                                                >
                                                    <div className="text-2xl mb-2">
                                                        {lang === 'vi' && '🇻🇳'}
                                                        {lang === 'en' && '🇺🇸'}
                                                    </div>
                                                    <div className="font-medium">
                                                        {lang === 'vi' && 'Tiếng Việt'}
                                                        {lang === 'en' && 'English'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {settings.display.language === 'en' && 'Hiện tại chỉ hỗ trợ tiếng Việt'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && settings && (
                            <div className="max-w-2xl space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Xác thực hai yếu tố (2FA)</h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-start">
                                            <span className="text-2xl mr-3">🔐</span>
                                            <div>
                                                <p className="font-medium text-blue-900">Tăng cường bảo mật tài khoản</p>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Xác thực hai yếu tố giúp bảo vệ tài khoản của bạn khỏi truy cập trái phép
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Trạng thái 2FA</p>
                                            <p className="text-sm text-gray-500">
                                                {settings.security.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newSettings = {
                                                    ...settings,
                                                    security: { ...settings.security, twoFactorEnabled: !settings.security.twoFactorEnabled }
                                                }
                                                handleUpdateSettings(newSettings)
                                            }}
                                            className={`
                                        px-4 py-2 rounded-lg font-medium
                                        ${settings.security.twoFactorEnabled
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                                                }
                                    `}
                                        >
                                            {settings.security.twoFactorEnabled ? 'Tắt 2FA' : 'Bật 2FA'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Chức năng này hiện đang trong giai đoạn phát triển
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Lịch sử đăng nhập</h3>
                                    <div className="space-y-3">
                                        {loginHistory.map((item) => (
                                            <div key={item.id} className="p-4 border rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">{item.device}</p>
                                                            {item.current && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                                    Hiện tại
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">📍 {item.location}</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            IP: {item.ip} • {new Date(item.timestamp).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
