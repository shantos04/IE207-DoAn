import { useEffect, useState } from 'react'
import { listOrders, updateOrderStatus, type Order } from '../services/orders'
import { Link } from 'react-router-dom'

const statusLabels: Record<string, string> = {
    draft: 'Nháp',
    confirmed: 'Đã xác nhận',
    shipped: 'Đã giao',
    completed: 'Hoàn thành',
    canceled: 'Đã hủy',
}

const statusColors: Record<string, string> = {
    draft: 'badge bg-gray-100 text-gray-700 border-gray-200',
    confirmed: 'badge badge-blue',
    shipped: 'badge badge-yellow',
    completed: 'badge badge-green',
    canceled: 'badge badge-red',
}

export default function Orders() {
    const [items, setItems] = useState<Order[]>([])
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await listOrders(status ? { status } : undefined)
            setItems(res.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [status])

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (!confirm(`Chuyển trạng thái thành "${statusLabels[newStatus]}"?`)) return
        try {
            await updateOrderStatus(id, newStatus)
            fetchData()
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Lỗi')
        }
    }

    const handlePrint = (order: Order, type: 'packing' | 'invoice') => {
        const label = type === 'packing' ? 'phiếu đóng gói' : 'hóa đơn/vận đơn'
        alert(`Tính năng in ${label} sẽ được kết nối với dịch vụ vận chuyển. Mã đơn: ${order.code}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
                    <p className="text-sm text-gray-600 mt-1">Theo dõi và xử lý đơn hàng</p>
                </div>
                <Link to="/orders/create" className="btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo đơn hàng
                </Link>
            </div>
            <div className="card">
                <div className="card-header">
                    <select value={status} onChange={e => setStatus(e.target.value)} className="select w-full md:w-64">
                        <option value="">Tất cả trạng thái</option>
                        <option value="draft">Nháp</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipped">Đã giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã hủy</option>
                    </select>
                </div>
                {loading && (
                    <div className="p-8 text-center">
                        <div className="inline-block spinner text-primary-600"></div>
                        <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                )}
                {!loading && (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Mã ĐH</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(o => (
                                    <tr key={o._id}>
                                        <td className="font-mono font-bold text-primary-700">{o.code}</td>
                                        <td className="font-medium text-gray-900">{o.customer?.name || '-'}</td>
                                        <td className="font-semibold text-gray-900">₫{o.total.toLocaleString('vi-VN')}</td>
                                        <td>
                                            <span className={`badge ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
                                        </td>
                                        <td className="text-gray-600">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {o.status === 'draft' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(o._id, 'confirmed')} 
                                                        className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                    >
                                                        Xác nhận
                                                    </button>
                                                )}
                                                {o.status === 'confirmed' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(o._id, 'shipped')} 
                                                        className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                                    >
                                                        Giao hàng
                                                    </button>
                                                )}
                                                {o.status === 'shipped' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(o._id, 'completed')} 
                                                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                    >
                                                        Hoàn thành
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <button 
                                                    onClick={() => handlePrint(o, 'packing')} 
                                                    className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                                                >
                                                    In phiếu đóng gói
                                                </button>
                                                <button 
                                                    onClick={() => handlePrint(o, 'invoice')} 
                                                    className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                                                >
                                                    In hóa đơn
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}