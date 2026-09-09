import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import ProtectedRoute from './component/PrivateRoutes.jsx'
import PublicRoute from './component/PublicRoutes.jsx'

function App() {
  return (
    <Routes>
      <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
      <Route path="*" element={<Navigate replace to="/register" />} />
    </Routes>
  )
}

export default App
