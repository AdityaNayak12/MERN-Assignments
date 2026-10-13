import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import {
  addToCartApi,
  calculateCartCount,
  calculateSubtotal,
  getCartApi,
  removeFromCartApi,
  updateCartQuantityApi,
} from '../services/cartApi.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const items = await getCartApi()
      setCartItems(items)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load your cart.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    let ignore = false

    async function initializeCart() {
      if (!user) {
        setCartItems([])
        return
      }
      setIsLoading(true)
      try {
        const items = await getCartApi()
        if (!ignore) setCartItems(items)
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Unable to load your cart.')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    initializeCart()

    return () => {
      ignore = true
    }
  }, [user])

  const addToCart = async (productId) => {
    setActionLoadingId(productId)
    setError('')
    try {
      const updatedCart = await addToCartApi(productId)
      setCartItems(updatedCart)
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to add item to cart.'
      return { success: false, message }
    } finally {
      setActionLoadingId(null)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    setActionLoadingId(productId)
    setError('')
    try {
      const updatedCart = await updateCartQuantityApi(productId, newQuantity)
      setCartItems(updatedCart)
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update quantity.'
      return { success: false, message }
    } finally {
      setActionLoadingId(null)
    }
  }

  const removeFromCart = async (productId) => {
    setActionLoadingId(productId)
    setError('')
    try {
      const updatedCart = await removeFromCartApi(productId)
      setCartItems(updatedCart)
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to remove item.'
      return { success: false, message }
    } finally {
      setActionLoadingId(null)
    }
  }

  const cartCount = useMemo(() => calculateCartCount(cartItems), [cartItems])
  const subtotal = useMemo(() => calculateSubtotal(cartItems), [cartItems])

  const getItemQuantity = (productId) => {
    const item = cartItems.find(
      (entry) => (entry?.product?._id || entry?.product)?.toString() === productId?.toString()
    )
    return item ? item.quantity : 0
  }

  const isItemLoading = (productId) => actionLoadingId === productId

  const value = {
    cartItems,
    isLoading,
    error,
    cartCount,
    subtotal,
    actionLoadingId,
    isItemLoading,
    getItemQuantity,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
