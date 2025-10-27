import { useEffect, useState } from 'react'
import { listInventoryMovements, createInventoryMovement, type InventoryMovement } from '../services/inventory'
import { listProducts, type Product } from '../services/products'

export default function Inventory() {
    const [items, setItems] = useState<InventoryMovement[]>([])
    const [type, setType] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formType, setFormType] = useState<'in' | 'out' | 'adjust'>('in')

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await listInventoryMovements(type ? { type } : undefined)
            setItems(res.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [type])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Kho</h2>
                <div className="space-x-2">
                    <button onClick={() => { setFormType('in'); setShowForm(true) }} className="px-3 py-2 text-sm rounded bg-green-600 text-white">Nhập kho</button>
                    <button onClick={() => { setFormType('out'); setShowForm(true) }} className="px-3 py-2 text-sm rounded bg-red-600 text-white">Xuất kho</button>
                    <button onClick={() => { setFormType('adjust'); setShowForm(true) }} className="px-3 py-2 text-sm rounded bg-yellow-600 text-white">Điều chỉnh</button>
                </div>
            </div>
            <div className="bg-white rounded-lg border">
                <div className="p-3 border-b flex items-center gap-2">
                    <select value={type} onChange={e => setType(e.target.value)} title="Lọc loại phiếu" className="rounded border-gray-300">
                        <option value="">Tất cả</option>
                        <option value="in">Nhập kho</option>
                        <option value="out">Xuất kho</option>
                        <option value="adjust">Điều chỉnh</option>
                    </select>
                </div>
                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {!loading && (
                    <div className="p-2 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">Loại</th>
                                    <th className="p-2">Sản phẩm</th>
                                    <th className="p-2">Số lượng</th>
                                    <th className="p-2">Ghi chú</th>
                                    <th className="p-2">Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(i => (
                                    <tr key={i._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-xs ${i.type === 'in' ? 'bg-green-100 text-green-700' : i.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {i.type === 'in' ? 'Nhập' : i.type === 'out' ? 'Xuất' : 'Điều chỉnh'}
                                            </span>
                                        </td>
                                        <td className="p-2">{i.product?.name} ({i.product?.sku})</td>
                                        <td className="p-2 font-medium">{i.qty}</td>
                                        <td className="p-2">{i.note || '-'}</td>
                                        <td className="p-2">{new Date(i.createdAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {showForm && <InventoryForm type={formType} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchData() }} />}
        </div>
    )
}

function InventoryForm({ type, onClose, onSaved }: { type: 'in' | 'out' | 'adjust'; onClose: () => void; onSaved: () => void }) {
    const [products, setProducts] = useState<Product[]>([])
    const [form, setForm] = useState({ product: '', qty: 1, note: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        listProducts().then(res => setProducts(res.items)).catch(console.error)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createInventoryMovement({ ...form, type, qty: Number(form.qty) })
            onSaved()
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Lỗi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{type === 'in' ? 'Nhập kho' : type === 'out' ? 'Xuất kho' : 'Điều chỉnh kho'}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">Sản phẩm <span className="text-red-600">*</span></label>
                        <select value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} className="w-full rounded border-gray-300" required>
                            <option value="">Chọn sản phẩm</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Số lượng <span className="text-red-600">*</span></label>
                        <input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: Number(e.target.value) })} placeholder="Số lượng" className="w-full rounded border-gray-300" required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Ghi chú</label>
                        <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú" className="w-full rounded border-gray-300" rows={2} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={loading} className="flex-1 rounded bg-primary-600 text-white py-2 hover:bg-primary-700 disabled:opacity-50">
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 rounded bg-gray-200 py-2 hover:bg-gray-300">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    )
}