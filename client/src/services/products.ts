import api from '../lib/api'

export type Product = {
    _id: string
    name: string
    sku: string
    partNumber?: string
    brand?: string
    category?: string
    price: number
    cost?: number
    stock: number
    reorderPoint?: number
    supplier?: string
    image?: string
    description?: string
}

export async function listProducts(params?: { q?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/products', { params })
    return data as { items: Product[]; total: number }
}

export async function createProduct(productData: Partial<Product>) {
    const { data } = await api.post('/products', productData)
    return data
}

export async function updateProduct(id: string, productData: Partial<Product>) {
    const { data } = await api.put(`/products/${id}`, productData)
    return data
}

export async function deleteProduct(id: string) {
    const { data } = await api.delete(`/products/${id}`)
    return data
}
