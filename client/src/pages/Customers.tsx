import { useEffect, useState } from 'react'
import { listCustomers, createCustomer, updateCustomer, deleteCustomer, type Customer } from '../services/customers'

export default function Customers() {
    const [items, setItems] = useState<Customer[]>([])
    const [q, setQ] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editItem, setEditItem] = useState<Customer | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await listCustomers(q ? { q } : undefined)
            setItems(res.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa khách hàng này?')) return
        try {
            await deleteCustomer(id)
            fetchData()
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Lỗi')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Khách hàng</h2>
                <button onClick={() => { setEditItem(null); setShowForm(true) }} className="px-3 py-2 text-sm rounded bg-primary-600 text-white">Thêm khách hàng</button>
            </div>
            <div className="card">
                <div className="card-header">
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Tìm theo tên, email, SĐT"
                        title="Tìm kiếm khách hàng"
                        className="input w-full md:w-96"
                    />
                    <button onClick={fetchData} className="btn btn-secondary">Tìm</button>
                </div>
                {loading && <div className="p-4 text-sm text-gray-500">Đang tải...</div>}
                {!loading && (
                    <div className="p-2 overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                    <th>Email</th>
                                    <th>Điện thoại</th>
                                    <th>Địa chỉ</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(c => (
                                    <tr key={c._id} className="hover:bg-gray-50">
                                        <td className="font-medium">{c.name}</td>
                                        <td>{c.email || '-'}</td>
                                        <td>{c.phone || '-'}</td>
                                        <td>{c.address || '-'}</td>
                                        <td>
                                            <button onClick={() => { setEditItem(c); setShowForm(true) }} className="text-primary-600 hover:underline mr-2">Sửa</button>
                                            <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {showForm && <CustomerForm item={editItem} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchData() }} />}
        </div>
    )
}

function CustomerForm({ item, onClose, onSaved }: { item: Customer | null; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({ name: item?.name || '', email: item?.email || '', phone: item?.phone || '', address: item?.address || '', taxId: item?.taxId || '', note: item?.note || '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (item) await updateCustomer(item._id, form)
            else await createCustomer(form)
            onSaved()
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Lỗi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{item ? 'Sửa' : 'Thêm'} khách hàng</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">Tên <span className="text-red-600">*</span></label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tên khách hàng" title="Tên khách hàng" className="input" required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" title="Email" className="input" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Điện thoại</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0912345678" title="Điện thoại" className="input" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Địa chỉ</label>
                        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ" title="Địa chỉ" className="input" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Mã số thuế</label>
                        <input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} placeholder="MST" title="Mã số thuế" className="input" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Ghi chú</label>
                        <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú" title="Ghi chú" className="textarea" rows={2} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button type="button" onClick={onClose} className="btn btn-outline flex-1">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    )
}