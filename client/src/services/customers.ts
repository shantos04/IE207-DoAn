import api from '../lib/api'

export type Customer = {
    _id: string
    name: string
    email?: string
    phone?: string
    address?: string
    taxId?: string
    note?: string
    createdAt: string
}

export async function listCustomers(params?: { q?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/customers', { params })
    return data as { items: Customer[]; total: number }
}

export async function getCustomer(id: string) {
    const { data } = await api.get(`/customers/${id}`)
    return data as Customer
}

export async function createCustomer(payload: Partial<Customer>) {
    const { data } = await api.post('/customers', payload)
    return data as Customer
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
    const { data } = await api.put(`/customers/${id}`, payload)
    return data as Customer
}

export async function deleteCustomer(id: string) {
    await api.delete(`/customers/${id}`)
}
