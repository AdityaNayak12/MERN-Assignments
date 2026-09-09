import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function PublicRoute({ children }) {
  const { user } = useAuth()

  if(!user){
    return children
  }
  return <Navigate replace to="/home" />
}

export default PublicRoute
