import { useEffect, useState } from 'react'
import { listOrders, cancelOrder, type Order } from '../services/orders'

const statusText: Record<string, string> = {
    draft: 'Nháp',
    confirmed: 'Đã xác nhận',
    shipped: 'Đang giao',
    completed: 'Hoàn thành',
    canceled: 'Đã hủy'
}

const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800'
}

export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true)
            try {
                const res = await listOrders()
                setOrders(res.items)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Đơn hàng của tôi</h2>
                <p className="text-sm text-gray-600 mt-1">Theo dõi trạng thái đơn hàng</p>
            </div>

            <div className="card">
                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {!loading && (
                    <div className="divide-y">
                        {orders.map(order => (
                            <div key={order._id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Đơn hàng #{order.code}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <span className={`badge ${statusColor[order.status]}`}>
                                        {statusText[order.status]}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {order.items.map((item, idx) => (
                                        <div key={`${order._id}-${idx}`} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {typeof item.product === 'object' && item.product ? item.product.name : 'Sản phẩm'} × {item.qty}
                                            </span>
                                            <span className="text-gray-900">
                                                {(item.price * item.qty).toLocaleString('vi-VN')}₫
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {order.note && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        <span className="font-medium">Ghi chú:</span> {order.note}
                                    </p>
                                )}

                                <div className="flex justify-between items-center pt-3 border-t">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">Tổng cộng:</span>
                                        <span className="text-lg font-bold text-primary-600">
                                            {order.total.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                    {['draft', 'confirmed'].includes(order.status) && (
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return
                                                try {
                                                    const updated = await cancelOrder(order._id)
                                                    // Cập nhật state
                                                    setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
                                                } catch (e: any) {
                                                    alert(e?.response?.data?.message || 'Không thể hủy đơn')
                                                }
                                            }}
                                            className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                Bạn chưa có đơn hàng nào
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
