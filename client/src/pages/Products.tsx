import { useEffect, useState } from 'react'
import { listProducts, type Product } from '../services/products'

export default function Products() {
    const [items, setItems] = useState<Product[]>([])
    const [q, setQ] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await listProducts(q ? { q } : undefined)
            setItems(res.items)
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Lỗi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sản phẩm</h2>
                <button className="px-3 py-2 text-sm rounded bg-primary-600 text-white">Thêm sản phẩm</button>
            </div>
            <div className="bg-white rounded-lg border">
                <div className="p-3 border-b flex items-center gap-2">
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, SKU, mã linh kiện" className="w-full md:w-96 rounded border-gray-300" />
                    <button onClick={fetchData} className="px-3 py-2 text-sm rounded bg-gray-100">Tìm</button>
                </div>
                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {error && <div className="p-4 text-sm text-red-600">{error}</div>}
                {!loading && !error && (
                    <div className="p-2 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">SKU</th>
                                    <th className="p-2">Tên</th>
                                    <th className="p-2">Hãng</th>
                                    <th className="p-2">Giá</th>
                                    <th className="p-2">Tồn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(p => (
                                    <tr key={p._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-mono">{p.sku}</td>
                                        <td className="p-2">{p.name}</td>
                                        <td className="p-2">{p.brand ?? '-'}</td>
                                        <td className="p-2">{p.price.toLocaleString('vi-VN')}</td>
                                        <td className="p-2">{p.stock}</td>
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
