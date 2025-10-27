import api from '../lib/api'

export type Supplier = {
    _id: string
    name: string
    email?: string
    phone?: string
    address?: string
    taxId?: string
    note?: string
    createdAt: string
}

export async function listSuppliers(params?: { q?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/suppliers', { params })
    return data as { items: Supplier[]; total: number }
}

export async function getSupplier(id: string) {
    const { data } = await api.get(`/suppliers/${id}`)
    return data as Supplier
}

export async function createSupplier(payload: Partial<Supplier>) {
    const { data } = await api.post('/suppliers', payload)
    return data as Supplier
}

export async function updateSupplier(id: string, payload: Partial<Supplier>) {
    const { data } = await api.put(`/suppliers/${id}`, payload)
    return data as Supplier
}

export async function deleteSupplier(id: string) {
    await api.delete(`/suppliers/${id}`)
}
