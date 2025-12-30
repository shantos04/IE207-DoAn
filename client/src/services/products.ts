import api from '../lib/api'

export type Product = {
    _id: string
    name: string
    sku: string
    partNumber?: string
    brand?: string
    manufacturer?: string
    category?: string
    price: number
    wholesalePrice?: number
    cost?: number
    stock: number
    reorderPoint?: number
    minStockLevel?: number
    unit?: string
    binLocation?: string
    status?: 'available' | 'out_of_stock' | 'discontinued'
    supplier?: string
    image?: string
    description?: string
    specifications?: {
        voltage?: string
        current?: string
        power?: string
        resistance?: string
        capacitance?: string
        frequency?: string
        temperature?: string
        package?: string
        datasheet?: string
        other?: Record<string, any>
    }
}

export async function listProducts(params?: { q?: string; category?: string; page?: number; limit?: number; brand?: string; status?: string; lowStock?: boolean }) {
    const { data } = await api.get('/products', { params })
    return data as { items: Product[]; total: number }
}

export async function createProduct(productData: Partial<Product>) {
    const { data } = await api.post('/products', productData)
    return data
}

export async function getProduct(id: string) {
    const { data } = await api.get(`/products/${id}`)
    return data as Product
}

export async function updateProduct(id: string, productData: Partial<Product>) {
    const { data } = await api.put(`/products/${id}`, productData)
    return data
}

export async function deleteProduct(id: string) {
    const { data } = await api.delete(`/products/${id}`)
    return data
}
