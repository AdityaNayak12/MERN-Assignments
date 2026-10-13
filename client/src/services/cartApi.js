import { axiosInstance } from '../axiosCalls/axios.js'

export async function getCartApi() {
  const response = await axiosInstance.get('/cart')
  return response.data.cart || []
}

export async function addToCartApi(productId) {
  const response = await axiosInstance.post(`/cart/${productId}`)
  return response.data.cart || []
}

export async function updateCartQuantityApi(productId, quantity) {
  const response = await axiosInstance.patch(`/cart/${productId}`, { quantity })
  return response.data.cart || []
}

export async function removeFromCartApi(productId) {
  const response = await axiosInstance.delete(`/cart/${productId}`)
  return response.data.cart || []
}

export function calculateSubtotal(cartItems = []) {
  return cartItems.reduce((acc, item) => {
    const price = Number(item?.product?.price) || 0
    const quantity = Number(item?.quantity) || 0
    return acc + price * quantity
  }, 0)
}

export function calculateCartCount(cartItems = []) {
  return cartItems.reduce((acc, item) => {
    const quantity = Number(item?.quantity) || 0
    return acc + quantity
  }, 0)
}

export function getCartState({ isLoading, error, cartItems = [] }) {
  if (isLoading) return 'loading'
  if (error) return 'error'
  if (!cartItems || cartItems.length === 0) return 'empty'
  return 'ready'
}
