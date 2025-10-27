import { useEffect, useState } from 'react'
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier, type Supplier } from '../services/suppliers'

export default function Suppliers() {
    const [items, setItems] = useState<Supplier[]>([])
    const [q, setQ] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editItem, setEditItem] = useState<Supplier | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await listSuppliers(q ? { q } : undefined)
            setItems(res.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa nhà cung cấp này?')) return
        try {
            await deleteSupplier(id)
            fetchData()
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Lỗi')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Nhà cung cấp</h2>
                <button onClick={() => { setEditItem(null); setShowForm(true) }} className="px-3 py-2 text-sm rounded bg-primary-600 text-white">Thêm NCC</button>
            </div>
            <div className="bg-white rounded-lg border">
                <div className="p-3 border-b flex items-center gap-2">
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, email, SĐT" className="w-full md:w-96 rounded border-gray-300" />
                    <button onClick={fetchData} className="px-3 py-2 text-sm rounded bg-gray-100">Tìm</button>
                </div>
                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {!loading && (
                    <div className="p-2 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">Tên</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Điện thoại</th>
                                    <th className="p-2">Địa chỉ</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(s => (
                                    <tr key={s._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{s.name}</td>
                                        <td className="p-2">{s.email || '-'}</td>
                                        <td className="p-2">{s.phone || '-'}</td>
                                        <td className="p-2">{s.address || '-'}</td>
                                        <td className="p-2">
                                            <button onClick={() => { setEditItem(s); setShowForm(true) }} className="text-primary-600 hover:underline mr-2">Sửa</button>
                                            <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {showForm && <SupplierForm item={editItem} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchData() }} />}
        </div>
    )
}

function SupplierForm({ item, onClose, onSaved }: { item: Supplier | null; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({ name: item?.name || '', email: item?.email || '', phone: item?.phone || '', address: item?.address || '', taxId: item?.taxId || '', note: item?.note || '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (item) await updateSupplier(item._id, form)
            else await createSupplier(form)
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
                <h3 className="text-lg font-semibold mb-4">{item ? 'Sửa' : 'Thêm'} nhà cung cấp</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">Tên <span className="text-red-600">*</span></label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded border-gray-300" required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Điện thoại</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Địa chỉ</label>
                        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Mã số thuế</label>
                        <input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} className="w-full rounded border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Ghi chú</label>
                        <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full rounded border-gray-300" rows={2} />
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