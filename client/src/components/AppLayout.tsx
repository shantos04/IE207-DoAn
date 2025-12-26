import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const staffMenu = [
    { to: '/', label: 'Tổng quan' },
    { to: '/products', label: 'Sản phẩm' },
    { to: '/orders', label: 'Đơn hàng' },
    { to: '/inventory', label: 'Kho' },
    { to: '/suppliers', label: 'Nhà cung cấp' },
    { to: '/customers', label: 'Khách hàng' },
    { to: '/settings', label: 'Thiết lập' },
]

const customerMenu = [
    { to: '/shop', label: '🛒 Cửa hàng' },
    { to: '/my-orders', label: '📦 Đơn hàng của tôi' },
]

export default function AppLayout() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState<string>('customer')

    useEffect(() => {
        // Decode JWT token to get user info
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setUserRole(payload.role || 'customer')
                // In production, you should fetch user name from API
            } catch (e) {
                console.error('Failed to decode token', e)
            }
        }
    }, [])

    const menu = userRole === 'customer' ? customerMenu : staffMenu

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className="h-screen grid grid-cols-[260px_1fr]">
            <aside className="hidden md:flex flex-col bg-white border-r border-gray-200">
                <div className="h-16 flex items-center px-4 border-b">
                    <Link to="/" className="font-semibold text-primary-700">ERP Linh Kiện</Link>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {menu.map((m) => (
                        <NavLink
                            key={m.to}
                            to={m.to}
                            end={m.to === '/'}
                            className={({ isActive }) =>
                                `block rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            {m.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-3 border-t">
                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200">
                        Đăng xuất
                    </button>
                </div>
            </aside>

            <div className="flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-between px-4 border-b bg-white">
                    <div className="font-medium text-gray-700">{getTitle(pathname)}</div>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-sm text-gray-500">Xin chào, User</span>
                        {userRole === 'staff' && (
                            <Link to="/shop" className="text-sm text-primary-700 hover:underline">🛒 Xem cửa hàng</Link>
                        )}
                        <button onClick={logout} className="text-sm text-primary-700 hover:underline">Đăng xuất</button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

function getTitle(path: string) {
    const allMenus = [...staffMenu, ...customerMenu]
    const found = allMenus.find(m => (m.to === '/' ? path === '/' : path.startsWith(m.to)))
    return found?.label ?? 'Trang'
}
