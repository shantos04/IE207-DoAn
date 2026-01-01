import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

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
    { to: '/shop', label: 'Cửa hàng' },
    { to: '/my-orders', label: 'Đơn hàng của tôi' },
]

export default function AppLayout() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState<string>('customer')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const isShopPage = pathname.startsWith('/shop')
    const isSettingsPage = pathname.startsWith('/settings')

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
    const isCustomerPage = isShopPage || pathname.startsWith('/my-orders') || isSettingsPage

    const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname, menu), [pathname, menu])

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className={`h-screen grid ${isCustomerPage ? 'grid-cols-1' : sidebarCollapsed ? 'grid-cols-[80px_1fr]' : 'grid-cols-[260px_1fr]'}`}>
            <aside className={`${isCustomerPage ? 'hidden' : 'hidden md:flex flex-col bg-white border-r border-gray-200'} ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-16 flex items-center px-4 border-b">
                    <Link to="/" className={`font-semibold text-primary-700 ${sidebarCollapsed ? 'text-sm text-center w-full' : ''}`}>
                        {sidebarCollapsed ? 'ERP' : 'ERP Linh Kiện'}
                    </Link>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {menu.map((m) => (
                        <NavLink
                            key={m.to}
                            to={m.to}
                            end={m.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-2'} rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`
                            }
                        >
                            {sidebarCollapsed ? m.label.charAt(0) : m.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-3 border-t">
                    <button onClick={logout} className={`w-full ${sidebarCollapsed ? 'text-center' : 'text-left'} px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200`}>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            <div className="flex flex-col min-w-0">
                {!isCustomerPage && (
                    <header className="h-16 flex items-center gap-3 px-4 border-b bg-white">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 rounded-lg border border-gray-200 hover:border-primary-200 hover:text-primary-700"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            {breadcrumbs.map((bc, idx) => (
                                <span key={bc.path} className="flex items-center gap-2">
                                    <Link to={bc.path} className="hover:text-primary-700 font-medium">{bc.label}</Link>
                                    {idx < breadcrumbs.length - 1 && <span className="text-gray-400">/</span>}
                                </span>
                            ))}
                        </div>

                        <div className="flex-1 max-w-xl">
                            <div className="relative">
                                <input
                                    className="input h-10 w-full pl-10 pr-3 text-sm"
                                    placeholder="Tìm nhanh đơn hàng, khách hàng, sản phẩm..."
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="relative p-2 rounded-full hover:bg-gray-100" aria-label="Thông báo">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5">3</span>
                            </button>
                            {userRole === 'staff' && (
                                <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-primary-700 hover:border-primary-300">
                                    🛒 Xem cửa hàng
                                </Link>
                            )}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(v => !v)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:border-primary-300"
                                    aria-haspopup="menu"
                                    aria-expanded={showProfileMenu}
                                >
                                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">A</span>
                                    <span className="hidden sm:inline">Admin</span>
                                </button>
                                {showProfileMenu && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-sm"
                                        onMouseLeave={() => setShowProfileMenu(false)}
                                    >
                                        <Link to={userRole === 'customer' ? '/my-orders' : '/settings'} className="block px-3 py-2 rounded hover:bg-gray-50">
                                            {userRole === 'customer' ? 'Đơn hàng của tôi' : 'Cài đặt cá nhân'}
                                        </Link>
                                        <button onClick={logout} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">Đăng xuất</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                )}
                <main className={`flex-1 overflow-y-auto ${isCustomerPage ? 'p-0' : 'p-4'}`}>
                    <div className={isCustomerPage ? '' : 'max-w-7xl mx-auto'}>
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

function buildBreadcrumbs(path: string, menu: { to: string; label: string }[]) {
    const segments = path.split('/').filter(Boolean)
    const crumbs = [{ path: '/', label: 'Trang chủ' }]
    let current = ''
    segments.forEach(seg => {
        current += `/${seg}`
        const match = menu.find(m => current.startsWith(m.to))
        crumbs.push({ path: current, label: match?.label || titleCase(seg) })
    })
    // Remove duplicates by path
    const unique = new Map<string, { path: string; label: string }>()
    crumbs.forEach(c => unique.set(c.path, c))
    return Array.from(unique.values())
}

function titleCase(text: string) {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
}
