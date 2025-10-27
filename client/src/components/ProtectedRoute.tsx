import { Navigate, useLocation } from 'react-router-dom'
import type { PropsWithChildren } from 'react'

export default function ProtectedRoute({ children }: PropsWithChildren) {
    const location = useLocation()
    const token = localStorage.getItem('token')
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }
    return children
}
