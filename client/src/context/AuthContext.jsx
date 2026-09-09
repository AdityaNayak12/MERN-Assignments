import { createContext, useContext, useEffect, useState } from "react";
import { axiosInstance } from "../axiosCalls/axios";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const checkAuth = async () => {
        const userData = await axiosInstance.get('/user/me')
        setUser(userData.data.authenticatedUser)
    }

    useEffect(() => {
        checkAuth()
    } , [])

    return (
        <AuthContext.Provider value={{ user, checkAuth }}>
          {children}  
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> useContext(AuthContext)
