import api from '../lib/api'

export type Order = {
    _id: string
    code: string
    customer: { _id: string; name: string; email?: string; phone?: string }
    status: 'draft' | 'confirmed' | 'shipped' | 'completed' | 'canceled'
    items: Array<{
        product: { _id: string; name: string; sku: string }
        qty: number
        price: number
    }>
    total: number
    note?: string
    createdAt: string
}

export async function listOrders(params?: { status?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/orders', { params })
    return data as { items: Order[]; total: number }
}

export async function getOrder(id: string) {
    const { data } = await api.get(`/orders/${id}`)
    return data as Order
}

export async function createOrder(payload: { customer: string; items: Array<{ product: string; qty: number; price: number }>; note?: string }) {
    const { data } = await api.post('/orders', payload)
    return data as Order
}

export async function updateOrderStatus(id: string, status: string) {
    const { data } = await api.put(`/orders/${id}/status`, { status })
    return data as Order
}

export async function deleteOrder(id: string) {
    await api.delete(`/orders/${id}`)
}
