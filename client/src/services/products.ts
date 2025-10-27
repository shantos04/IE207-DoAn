import api from '../lib/api'

export type Product = {
    _id: string
    name: string
    sku: string
    partNumber?: string
    brand?: string
    price: number
    stock: number
}

export async function listProducts(params?: { q?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/products', { params })
    return data as { items: Product[]; total: number }
}
