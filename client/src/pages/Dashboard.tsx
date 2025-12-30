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
    if (revenueToday > 0) notifications.push({ title: 'Doanh thu hôm nay', detail: `₫${revenueToday.toLocaleString('vi-VN')}` })

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

    if (loading) return <div className="p-4">Đang tải...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tổng quan</h2>
                <button
                    onClick={handleExportExcel}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Tải báo cáo Excel
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Doanh thu hôm nay" value={`₫ ${revenueToday.toLocaleString('vi-VN')}`} />
                <StatCard label="Đơn hàng chờ xử lý" value={ordersPending} />
                <StatCard label="Sản phẩm sắp hết" value={lowStockCount} className="text-red-600" />
                <StatCard label="Tổng sản phẩm" value={stats?.totalProducts || 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium mb-3">Top 5 sản phẩm bán chạy</h3>
                    {stats?.topProducts?.length > 0 ? (
                        <div className="space-y-2">
                            {stats.topProducts.map((item: any, idx: number) => (
                                <div key={`top-product-${item.product?._id || idx}`} className="flex justify-between items-center text-sm">
                                    <span>{item.product?.name}</span>
                                    <span className="font-medium text-primary-600">{item.totalQty} SP - ₫{item.totalRevenue.toLocaleString('vi-VN')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                    )}
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium mb-3">Biểu đồ sản phẩm đã bán</h3>
                    {stats?.topProducts?.length > 0 ? (
                        <ProductSalesChart data={stats.topProducts} />
                    ) : (
                        <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                    )}
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <h3 className="font-medium mb-3">Thông báo hệ thống</h3>
                    {notifications.length > 0 ? (
                        <ul className="space-y-2 text-sm text-gray-700">
                            {notifications.map((n, idx) => (
                                <li key={idx} className="p-2 rounded border border-gray-100 bg-gray-50">
                                    <div className="font-semibold">{n.title}</div>
                                    <div className="text-gray-600">{n.detail}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">Không có thông báo</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Doanh thu theo ngày (14 ngày gần nhất)</h3>
                </div>
                {revenueSeries.length > 0 ? (
                    <DailyRevenueChart data={revenueSeries} />
                ) : (
                    <p className="text-sm text-gray-500">Không có dữ liệu doanh thu</p>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, className }: { label: string; value: string | number; className?: string }) {
    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">{label}</div>
            <div className={`mt-1 text-2xl font-semibold ${className || ''}`}>{value}</div>
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
    // Fixed absolute scale: 1000đ = 0.007px => 1đ = 0.000007px
    // Auto-fit scaling: compute a "nice" rounded maximum for better proportional visualization
    const rawMax = Math.max(...series.map(d => d.revenue), 1)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
    const normalized = rawMax / magnitude
    let niceNormalized: number
    if (normalized <= 1) niceNormalized = 1
    else if (normalized <= 2) niceNormalized = 2
    else if (normalized <= 5) niceNormalized = 5
    else niceNormalized = 10
    const niceMax = niceNormalized * magnitude

    // Tick marks (4 intervals)
    const tickCount = 4
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax / tickCount) * i))

    // SVG config (fixed height)
    const barGap = 6
    const barWidth = 24
    const chartHeight = 160
    const totalWidth = series.length * (barWidth + barGap)
    const viewBoxHeight = chartHeight + 30 // space for labels

    const scaledHeights = series.map(d => {
        if (d.revenue === 0) return 0
        const h = (d.revenue / niceMax) * (chartHeight - 10)
        return Math.max(4, Math.round(h))
    })
    return (
        <div>
            <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${totalWidth} ${viewBoxHeight}`} className="w-full max-w-full">
                    {/* Grid lines & ticks */}
                    {ticks.map((t, idx) => {
                        const y = chartHeight - (t / niceMax) * (chartHeight - 10)
                        return (
                            <g key={`tick-${t}-${idx}`}>
                                <line x1={0} y1={y} x2={totalWidth} y2={y} className="stroke-gray-100" strokeWidth={1} />
                                {t > 0 && (
                                    <text x={2} y={y - 2} className="fill-gray-400 text-[9px]" >₫{t.toLocaleString('vi-VN')}</text>
                                )}
                            </g>
                        )
                    })}
                    {/* Bars */}
                    {series.map((d, idx) => {
                        const h = scaledHeights[idx]
                        const x = idx * (barWidth + barGap)
                        const y = chartHeight - h
                        const isToday = d.date === todayKey
                        return (
                            <g key={`bar-${d.date}`}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={h}
                                    className={isToday ? 'fill-primary-600' : 'fill-primary-500'}
                                >
                                    <title>{`Ngày ${d.date}\nDoanh thu: ₫${d.revenue.toLocaleString('vi-VN')}\nĐơn: ${d.orders}`}</title>
                                </rect>
                                {d.revenue > 0 && (
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 6}
                                        textAnchor="middle"
                                        className="fill-gray-700 text-[10px] font-medium"
                                    >
                                        ₫{d.revenue.toLocaleString('vi-VN')}
                                    </text>
                                )}
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 12}
                                    textAnchor="middle"
                                    className="fill-gray-600 text-[9px]"
                                >
                                    {d.date.slice(5)}
                                </text>
                            </g>
                        )
                    })}
                    {/* Axis line */}
                    <line x1={0} y1={chartHeight} x2={totalWidth} y2={chartHeight} className="stroke-gray-300" strokeWidth={1} />
                </svg>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">* Doanh thu = tổng đơn ở trạng thái đã xác nhận / đang giao / hoàn thành. Cột hôm nay tô đậm.</p>
        </div>
    )
}