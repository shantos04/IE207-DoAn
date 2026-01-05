import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats, getDailyRevenue } from '../services/reports'
import * as XLSX from 'xlsx'

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null)
    const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number; orders: number }[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if user is customer, redirect to shop
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.role === 'customer') {
                    navigate('/shop', { replace: true })
                    return
                }
            } catch (e) {
                console.error('Failed to decode token', e)
            }
        }

        Promise.all([
            getDashboardStats(),
            getDailyRevenue()
        ])
            .then(([dash, rev]) => {
                setStats(dash)
                setRevenueSeries(rev.days)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [navigate])

    const revenueToday = revenueSeries.length > 0 ? revenueSeries[revenueSeries.length - 1].revenue : 0
    const ordersPending = stats?.ordersPending ?? stats?.ordersToday ?? 0
    const lowStockCount = stats?.lowStockCount ?? 0
    const notifications: { title: string; detail: string }[] = []
    if (ordersPending > 0) notifications.push({ title: 'Đơn hàng chờ xử lý', detail: `${ordersPending} đơn cần xác nhận/giao` })
    if (lowStockCount > 0) notifications.push({ title: 'Cảnh báo tồn kho thấp', detail: `${lowStockCount} sản phẩm dưới ngưỡng` })
    if (revenueToday > 0) notifications.push({ title: 'Doanh thu hôm nay', detail: `${revenueToday.toLocaleString('vi-VN')} VND` })

    const handleExportExcel = () => {
        const workbook = XLSX.utils.book_new()

        // Sheet 1: Dashboard stats
        const statsData = [
            ['Chỉ số', 'Giá trị'],
            ['Tổng sản phẩm', stats?.totalProducts || 0],
            ['Đơn hàng hôm nay', stats?.ordersToday || 0],
            ['Doanh thu tháng', stats?.revenueThisMonth || 0],
            ['Sản phẩm sắp hết', stats?.lowStockCount || 0]
        ]
        const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
        XLSX.utils.book_append_sheet(workbook, statsSheet, 'Thống kê tổng quan')

        // Sheet 2: Top products
        if (stats?.topProducts?.length > 0) {
            const topProductsData = [
                ['STT', 'Tên sản phẩm', 'Số lượng đã bán', 'Doanh thu'],
                ...stats.topProducts.map((item: any, idx: number) => [
                    idx + 1,
                    item.product?.name || 'N/A',
                    item.totalQty,
                    item.totalRevenue
                ])
            ]
            const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData)
            XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Top 5 sản phẩm')
        }

        // Sheet 3: Daily revenue
        if (revenueSeries.length > 0) {
            const revenueData = [
                ['Ngày', 'Doanh thu', 'Số đơn hàng'],
                ...revenueSeries.map(d => [d.date, d.revenue, d.orders])
            ]
            const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData)
            XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu theo ngày')
        }

        // Export file
        const fileName = `Bao-cao-${new Date().toISOString().slice(0, 10)}.xlsx`
        XLSX.writeFile(workbook, fileName)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
                <p className="mt-6 text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
        </div>
    )

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="card">
                <div className="card-header bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-xl -m-5 mb-0">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h1 className="text-3xl font-bold">Bảng điều khiển quản trị</h1>
                            <p className="text-primary-100 mt-2">Tổng quan kinh doanh và hoạt động hệ thống</p>
                        </div>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg border border-white/20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Xuất báo cáo Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Doanh thu hôm nay"
                        value={`${revenueToday.toLocaleString('vi-VN')} VND`}
                        icon="revenue"
                        color="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        label="Đơn hàng chờ xử lý"
                        value={ordersPending}
                        icon="pending"
                        color="from-orange-500 to-orange-600"
                        trend={ordersPending > 0 ? 'warning' : 'normal'}
                    />
                    <StatCard
                        label="Sản phẩm sắp hết"
                        value={lowStockCount}
                        icon="stock"
                        color="from-red-500 to-red-600"
                        trend={lowStockCount > 0 ? 'alert' : 'normal'}
                    />
                    <StatCard
                        label="Tổng sản phẩm"
                        value={stats?.totalProducts || 0}
                        icon="product"
                        color="from-green-500 to-green-600"
                    />
                </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Products */}
                    <div className="lg:col-span-1 card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.04 9H9V7.5a1.5 1.5 0 11-3 0V5H2a1 1 0 000 2h1v1.05A2.5 2.5 0 0015.95 11H17a1 1 0 000-2h-.5v-1h.5a1 1 0 000-2h-1.405l-.5-2H15V4a1 1 0 000-2h-.5V1H3z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900">Sản phẩm bán chạy</h3>
                        </div>
                        {stats?.topProducts?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.topProducts.map((item: any, idx: number) => (
                                    <div key={`top-product-${item.product?._id || idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</span>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <div className="text-sm font-bold text-indigo-600">{item.totalQty} SP</div>
                                            <div className="text-xs text-gray-500">{(item.totalRevenue / 1000000).toFixed(1)}M VND</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-6">Chưa có dữ liệu</p>
                        )}
                    </div>

                    {/* Chart */}
                    <div className="lg:col-span-1 card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900">Tỉ lệ bán hàng</h3>
                        </div>
                        {stats?.topProducts?.length > 0 ? (
                            <ProductSalesChart data={stats.topProducts} />
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-6">Chưa có dữ liệu</p>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="lg:col-span-1 card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-pink-100 rounded-lg">
                                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900">Cảnh báo hệ thống</h3>
                        </div>
                        {notifications.length > 0 ? (
                            <ul className="space-y-3">
                                {notifications.map((n, idx) => (
                                    <li key={idx} className="p-3 rounded-lg border-l-4 border-pink-500 bg-pink-50 hover:bg-pink-100 transition">
                                        <div className="font-bold text-sm text-gray-900">{n.title}</div>
                                        <div className="text-sm text-gray-700 mt-1">{n.detail}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-6">Không có thông báo</p>
                        )}
                    </div>
                </div>

            {/* Revenue Chart */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Doanh thu 14 ngày gần nhất</h3>
                </div>
                {revenueSeries.length > 0 ? (
                    <DailyRevenueChart data={revenueSeries} />
                ) : (
                    <p className="text-sm text-gray-500 text-center py-12">Không có dữ liệu doanh thu</p>
                )}
            </div>

            {/* Store Preview */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.04 9H9V7.5a1.5 1.5 0 11-3 0V5H2a1 1 0 000 2h1v1.05A2.5 2.5 0 0015.95 11H17a1 1 0 000-2h-.5v-1h.5a1 1 0 000-2h-1.405l-.5-2H15V4a1 1 0 000-2h-.5V1H3z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900">Quan sát cửa hàng</h3>
                    </div>
                    <a
                        href="/shop"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Mở cửa hàng
                    </a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    <p className="text-sm mb-3">Xem trước cửa hàng như khách hàng sẽ thấy</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Danh mục sản phẩm</p>
                            <p className="font-semibold text-gray-700">{stats?.totalProducts || 0} sản phẩm</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Doanh thu hôm nay</p>
                            <p className="font-semibold text-gray-700">{revenueToday.toLocaleString('vi-VN')} VND</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, color, trend }: { label: string; value: string | number; icon: string; color: string; trend?: 'normal' | 'warning' | 'alert' }) {
    const getIcon = () => {
        switch (icon) {
            case 'revenue':
                return <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M8.16 5.314l8.102 8.101a1 1 0 01-1.414 1.415L6.746 6.729V9a1 1 0 01-2 0V3a1 1 0 011-1h6a1 1 0 110 2H8.16z" /></svg>
            case 'pending':
                return <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
            case 'stock':
                return <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
            case 'product':
                return <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.04 9H9V7.5a1.5 1.5 0 11-3 0V5H2a1 1 0 000 2h1v1.05A2.5 2.5 0 015.5 15h8.5a2.5 2.5 0 002.45-2h.5a1 1 0 100-2h-.5V7H5V5h.5a1.5 1.5 0 001.5-1.5V2.5a1.5 1.5 0 00-1.5-1.5H3z" /></svg>
            default:
                return null
        }
    }

    const getTrendColor = () => {
        switch (trend) {
            case 'warning': return 'from-orange-100 to-orange-100 border-orange-200'
            case 'alert': return 'from-red-100 to-red-100 border-red-200'
            default: return 'from-white to-white border-gray-200'
        }
    }

    return (
        <div className={`bg-gradient-to-br ${getTrendColor()} rounded-xl border shadow-soft p-6 hover:shadow-lg transition-all transform hover:scale-[1.02]`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white`}>
                    {getIcon()}
                </div>
                <div className="text-right">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            {trend === 'alert' && (
                <div className="mt-3 text-xs text-red-700 font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Cần xử lý
                </div>
            )}
        </div>
    )
}

function ProductSalesChart({ data }: { data: any[] }) {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
    const total = data.reduce((sum, item) => sum + item.totalQty, 0)
    const maxQty = Math.max(...data.map(d => d.totalQty), 1)

    const barHeight = 24
    const barGap = 12
    const maxBarWidth = 280
    const labelWidth = 160
    const chartHeight = data.length * (barHeight + barGap)

    return (
        <div className="space-y-4">
            <svg viewBox={`0 0 ${labelWidth + maxBarWidth + 80} ${chartHeight}`} className="w-full">
                {data.map((item, idx) => {
                    const y = idx * (barHeight + barGap)
                    const barWidth = (item.totalQty / maxQty) * maxBarWidth
                    const percentage = ((item.totalQty / total) * 100).toFixed(1)

                    return (
                        <g key={`product-${item.name}`}>
                            {/* Product name */}
                            <text
                                x={0}
                                y={y + barHeight / 2 + 4}
                                className="fill-gray-700 text-xs font-medium"
                            >
                                {(item.product?.name || 'N/A').slice(0, 20)}
                            </text>

                            {/* Bar */}
                            <rect
                                x={labelWidth}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={colors[idx % colors.length]}
                                className="transition-all duration-300"
                            />

                            {/* Quantity and percentage */}
                            <text
                                x={labelWidth + barWidth + 8}
                                y={y + barHeight / 2 + 4}
                                className="fill-gray-600 text-xs"
                            >
                                {item.totalQty} SP ({percentage}%)
                            </text>
                        </g>
                    )
                })}
            </svg>

            {/* Summary */}
            <div className="pt-3 border-t text-xs text-gray-600">
                <div className="flex justify-between">
                    <span>Tổng sản phẩm đã bán:</span>
                    <span className="font-semibold">{total} SP</span>
                </div>
            </div>
        </div>
    )
}

function DailyRevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
    // Ensure today included; build series
    const todayKey = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    const hasToday = data.some(d => d.date === todayKey)
    const series = hasToday ? data : [...data, { date: todayKey, revenue: 0, orders: 0 }]

    // Auto-fit scaling
    const rawMax = Math.max(...series.map(d => d.revenue), 1)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
    const normalized = rawMax / magnitude
    let niceNormalized: number
    if (normalized <= 1) niceNormalized = 1
    else if (normalized <= 2) niceNormalized = 2
    else if (normalized <= 5) niceNormalized = 5
    else niceNormalized = 10
    const niceMax = niceNormalized * magnitude

    // Tick marks (5 intervals)
    const tickCount = 5
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax / tickCount) * i))

    // SVG config - improved
    const barGap = 12
    const barWidth = 32
    const chartHeight = 240
    const leftPadding = 120
    const rightPadding = 20
    const totalWidth = leftPadding + series.length * (barWidth + barGap) + rightPadding
    const viewBoxHeight = chartHeight + 50

    const scaledHeights = series.map(d => {
        if (d.revenue === 0) return 0
        const h = (d.revenue / niceMax) * (chartHeight - 20)
        return Math.max(4, Math.round(h))
    })

    return (
        <div>
            <div className="overflow-x-auto pb-4">
                <svg viewBox={`0 0 ${totalWidth} ${viewBoxHeight}`} style={{ minWidth: '100%', height: 'auto' }}>
                    {/* Background */}
                    <defs>
                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                            <stop offset="100%" stopColor="#1e40af" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="barGradientToday" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="1" />
                            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="1" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines & Y-axis labels */}
                    {ticks.map((t, idx) => {
                        const y = chartHeight - (t / niceMax) * (chartHeight - 20)
                        return (
                            <g key={`tick-${t}-${idx}`}>
                                <line x1={leftPadding} y1={y} x2={totalWidth - rightPadding} y2={y} className="stroke-gray-200" strokeWidth="1" opacity="0.6" />
                                {t > 0 && (
                                    <text x={leftPadding - 10} y={y + 4} textAnchor="end" className="fill-gray-600 text-sm font-medium" >
                                        {(t / 1000000).toFixed(1)}M
                                    </text>
                                )}
                            </g>
                        )
                    })}

                    {/* Y-axis */}
                    <line x1={leftPadding} y1={0} x2={leftPadding} y2={chartHeight} className="stroke-gray-300" strokeWidth="2" />

                    {/* X-axis */}
                    <line x1={leftPadding} y1={chartHeight} x2={totalWidth - rightPadding} y2={chartHeight} className="stroke-gray-300" strokeWidth="2" />

                    {/* Bars */}
                    {series.map((d, idx) => {
                        const h = scaledHeights[idx]
                        const x = leftPadding + idx * (barWidth + barGap)
                        const y = chartHeight - h
                        const isToday = d.date === todayKey

                        return (
                            <g key={`bar-${d.date}`}>
                                {/* Bar with rounded corners */}
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={h}
                                    rx="4"
                                    ry="4"
                                    fill={isToday ? 'url(#barGradientToday)' : 'url(#barGradient)'}
                                    opacity="0.9"
                                    className="hover:opacity-100 cursor-pointer transition-opacity"
                                >
                                    <title>{`Ngày ${d.date}\nDoanh thu: ${d.revenue.toLocaleString('vi-VN')} VND\nĐơn hàng: ${d.orders}`}</title>
                                </rect>

                                {/* Revenue label on top of bar */}
                                {d.revenue > 0 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 8}
                                        textAnchor="middle"
                                        className="fill-gray-800 text-xs font-bold"
                                    >
                                        {(d.revenue / 1000000).toFixed(1)}M
                                    </text>
                                )}

                                {/* Date label below X-axis */}
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    className="fill-gray-700 text-sm font-medium"
                                >
                                    {d.date.slice(5)}
                                </text>

                                {/* Order count as small label */}
                                {d.orders > 0 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight + 35}
                                        textAnchor="middle"
                                        className="fill-gray-500 text-xs"
                                    >
                                        {d.orders} đơn
                                    </text>
                                )}
                            </g>
                        )
                    })}
                </svg>
            </div>

            {/* Legend & Note */}
            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span>Ngày thường</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-900"></div>
                            <span>Hôm nay</span>
                        </div>
                    </div>
                </div>
                <p className="text-gray-500 text-xs italic">Nhấp vào cột để xem chi tiết</p>
            </div>
        </div>
    )
}