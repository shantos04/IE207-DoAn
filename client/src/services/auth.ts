import api from '../lib/api'

export async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    return data as { token: string; user: { id: string; name: string; email: string; role: string } }
}

export async function register(payload: { name: string; email: string; password: string; role: string }) {
    const { data } = await api.post('/auth/register', payload)
    return data as { token: string; user: { id: string; name: string; email: string; role: string } }
}

export async function loginWithGoogle(credential: string) {
    const { data } = await api.post('/auth/google', { credential })
    return data as { token: string; user: { id: string; name: string; email: string; role: string } }
}
