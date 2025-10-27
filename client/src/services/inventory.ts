import api from '../lib/api'

export type InventoryMovement = {
    _id: string
    type: 'in' | 'out' | 'adjust'
    product: { _id: string; name: string; sku: string }
    qty: number
    refType?: string
    refId?: string
    note?: string
    createdAt: string
}

export async function listInventoryMovements(params?: { type?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/inventory', { params })
    return data as { items: InventoryMovement[]; total: number }
}

export async function createInventoryMovement(payload: { type: string; product: string; qty: number; note?: string }) {
    const { data } = await api.post('/inventory', payload)
    return data as InventoryMovement
}

export async function getLowStockProducts() {
    const { data } = await api.get('/inventory/low-stock')
    return data
}
