import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute({ children }) {
  const { user } = useAuth()

  return user ? children : <Navigate replace to="/login" />
}

export default ProtectedRoute
