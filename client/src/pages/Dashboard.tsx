import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats } from '../services/reports'

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null)
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

        getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false))
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