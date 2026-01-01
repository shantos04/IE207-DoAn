import api from '../lib/api'

export interface UserProfile {
    _id: string
    name: string
    email: string
    phone?: string
    address?: string
    role: string
    createdAt: string
    updatedAt: string
}

export interface UserSettings {
    notifications: {
        email: boolean
        orderUpdates: boolean
        promotions: boolean
        newsletter: boolean
    }
    display: {
        theme: 'light' | 'dark' | 'auto'
        language: 'vi' | 'en'
    }
    security: {
        twoFactorEnabled: boolean
    }
}

export interface LoginHistory {
    id: number
    device: string
    location: string
    ip: string
    timestamp: string
    current: boolean
}

export async function getProfile() {
    const { data } = await api.get<UserProfile>('/users/profile')
    return data
}

export async function updateProfile(payload: { name: string; phone?: string; address?: string }) {
    const { data } = await api.put<UserProfile>('/users/profile', payload)
    return data
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post<{ message: string }>('/users/change-password', { 
        currentPassword, 
        newPassword 
    })
    return data
}

export async function getSettings() {
    const { data } = await api.get<UserSettings>('/users/settings')
    return data
}

export async function updateSettings(settings: UserSettings) {
    const { data } = await api.put<UserSettings>('/users/settings', { settings })
    return data
}

export async function getLoginHistory() {
    const { data } = await api.get<LoginHistory[]>('/users/login-history')
    return data
}
