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
    const isCustomerPage = (isShopPage || pathname.startsWith('/my-orders') || (isSettingsPage && userRole === 'customer'))

    const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname, menu), [pathname, menu])

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className={`h-screen grid ${isCustomerPage ? 'grid-cols-1' : sidebarCollapsed ? 'grid-cols-[80px_1fr]' : 'grid-cols-[260px_1fr]'} transition-all duration-300`}>
            <aside className={`${isCustomerPage ? 'hidden' : 'hidden md:flex flex-col bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/60 shadow-lg'} ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-16 flex items-center px-4 border-b border-gray-200/60 bg-gradient-to-r from-primary-600 to-primary-700">
                    <Link to="/" className={`font-bold text-white ${sidebarCollapsed ? 'text-lg text-center w-full' : 'text-xl'}`}>
                        {sidebarCollapsed ? 'ERP' : 'ERP Linh Kiện'}
                    </Link>
                </div>
                <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
                    {menu.map((m) => (
                        <NavLink
                            key={m.to}
                            to={m.to}
                            end={m.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md transform scale-[1.02]' 
                                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:shadow-sm'
                                }`
                            }
                        >
                            {sidebarCollapsed ? (
                                <span className="text-lg">{m.label.charAt(0)}</span>
                            ) : (
                                <>
                                    <span className="text-base">{getMenuIcon(m.to)}</span>
                                    <span>{m.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-3 border-t border-gray-200/60 bg-white/50">
                    <button 
                        onClick={logout} 
                        className={`w-full ${sidebarCollapsed ? 'text-center justify-center' : 'text-left justify-start'} flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 border border-red-200 transition-all duration-200`}
                    >
                        {!sidebarCollapsed && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        )}
                        {sidebarCollapsed ? 'ĐX' : 'Đăng xuất'}
                    </button>
                </div>
            </aside>

            <div className="flex flex-col min-w-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
                {!isCustomerPage && (
                    <header className="h-16 flex items-center gap-4 px-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            {breadcrumbs.map((bc, idx) => (
                                <span key={bc.path} className="flex items-center gap-2">
                                    <Link to={bc.path} className="hover:text-primary-700 font-semibold transition-colors">{bc.label}</Link>
                                    {idx < breadcrumbs.length - 1 && <span className="text-gray-400">/</span>}
                                </span>
                            ))}
                        </div>

                        <div className="flex-1 max-w-xl ml-4">
                            <div className="relative">
                                <input
                                    className="input h-10 w-full pl-10 pr-3 text-sm bg-white/90 border-gray-200"
                                    placeholder="Tìm nhanh đơn hàng, khách hàng, sản phẩm..."
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Thông báo">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">3</span>
                            </button>
                            {userRole === 'staff' && (
                                <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Cửa hàng
                                </Link>
                            )}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(v => !v)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold hover:border-primary-300 hover:bg-primary-50 transition-all shadow-sm"
                                    aria-haspopup="menu"
                                    aria-expanded={showProfileMenu}
                                >
                                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-md">A</span>
                                    <span className="hidden sm:inline">Admin</span>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showProfileMenu && (
                                    <div
                                        className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 text-sm z-50 animate-fade-in"
                                        onMouseLeave={() => setShowProfileMenu(false)}
                                    >
                                        <Link to={userRole === 'customer' ? '/my-orders' : '/settings'} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-50 transition-colors">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {userRole === 'customer' ? 'Đơn hàng của tôi' : 'Cài đặt cá nhân'}
                                        </Link>
                                        <button onClick={logout} className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-700 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                )}
                <main className={`flex-1 overflow-y-auto ${isCustomerPage ? 'p-0' : 'p-6'}`}>
                    <div className={isCustomerPage ? 'w-full' : 'w-full'}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

function getMenuIcon(path: string): string {
    // Return empty string - icons removed
    return ''
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
