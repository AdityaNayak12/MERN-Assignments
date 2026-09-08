import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: "http://localhost:8001/",
    withCredentials: true,
    headers:{
        "Content-Type":"application/json"
    }

})

export const registerCustomer = (values) =>
    axiosInstance.post("/user/register", values)
