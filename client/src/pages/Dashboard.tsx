import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats, getDailyRevenue } from '../services/reports'

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

    if (loading) return <div className="p-4">Đang tải...</div>

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Tổng quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng sản phẩm" value={stats?.totalProducts || 0} />
                <StatCard label="Đơn hàng hôm nay" value={stats?.ordersToday || 0} />
                <StatCard label="Doanh thu (tháng)" value={`₫ ${(stats?.revenueThisMonth || 0).toLocaleString('vi-VN')}`} />
                <StatCard label="Sản phẩm sắp hết" value={stats?.lowStockCount || 0} className="text-red-600" />
            </div>

            <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-3">Top 5 sản phẩm bán chạy</h3>
                {stats?.topProducts?.length > 0 ? (
                    <div className="space-y-2">
                        {stats.topProducts.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
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
                    {ticks.map(t => {
                        const y = chartHeight - (t / niceMax) * (chartHeight - 10)
                        return (
                            <g key={t}>
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
                            <g key={d.date}>
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