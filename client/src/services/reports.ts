import api from '../lib/api'

export async function getDashboardStats() {
    const { data } = await api.get('/reports/dashboard')
    return data
}

export async function getSalesReport(params?: { startDate?: string; endDate?: string }) {
    const { data } = await api.get('/reports/sales', { params })
    return data
}

export async function getInventoryReport() {
    const { data } = await api.get('/reports/inventory')
    return data
}
