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
    draft: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    canceled: 'bg-red-100 text-red-700',
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Đơn hàng</h2>
                <Link to="/orders/create" className="px-3 py-2 text-sm rounded bg-primary-600 text-white hover:bg-primary-700">Tạo đơn hàng</Link>
            </div>
            <div className="bg-white rounded-lg border">
                <div className="p-3 border-b flex items-center gap-2">
                    <select value={status} onChange={e => setStatus(e.target.value)} className="rounded border-gray-300">
                        <option value="">Tất cả trạng thái</option>
                        <option value="draft">Nháp</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipped">Đã giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã hủy</option>
                    </select>
                </div>
                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {!loading && (
                    <div className="p-2 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">Mã ĐH</th>
                                    <th className="p-2">Khách hàng</th>
                                    <th className="p-2">Tổng tiền</th>
                                    <th className="p-2">Trạng thái</th>
                                    <th className="p-2">Ngày tạo</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(o => (
                                    <tr key={o._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-mono font-medium">{o.code}</td>
                                        <td className="p-2">{o.customer?.name}</td>
                                        <td className="p-2">₫{o.total.toLocaleString('vi-VN')}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
                                        </td>
                                        <td className="p-2">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="p-2">
                                            {o.status === 'draft' && (
                                                <button onClick={() => handleStatusChange(o._id, 'confirmed')} className="text-primary-600 hover:underline mr-2">Xác nhận</button>
                                            )}
                                            {o.status === 'confirmed' && (
                                                <button onClick={() => handleStatusChange(o._id, 'shipped')} className="text-primary-600 hover:underline mr-2">Giao hàng</button>
                                            )}
                                            {o.status === 'shipped' && (
                                                <button onClick={() => handleStatusChange(o._id, 'completed')} className="text-primary-600 hover:underline mr-2">Hoàn thành</button>
                                            )}
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