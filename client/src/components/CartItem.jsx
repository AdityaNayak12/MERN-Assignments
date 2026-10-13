import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../services/productApi.js'
import { useCart } from '../context/CartContext.jsx'

export default function CartItem({ item }) {
  const { product, quantity } = item
  const { updateQuantity, removeFromCart, isItemLoading } = useCart()
  const [errorMsg, setErrorMsg] = useState('')

  if (!product) return null

  const isLoading = isItemLoading(product._id)
  const isMinQuantity = quantity <= 1
  const isMaxQuantity = quantity >= product.stock

  const handleDecrease = async () => {
    if (isMinQuantity || isLoading) return
    setErrorMsg('')
    const result = await updateQuantity(product._id, quantity - 1)
    if (!result.success) {
      setErrorMsg(result.message)
    }
  }

  const handleIncrease = async () => {
    if (isMaxQuantity || isLoading) return
    setErrorMsg('')
    const result = await updateQuantity(product._id, quantity + 1)
    if (!result.success) {
      setErrorMsg(result.message)
    }
  }

  const handleRemove = async () => {
    if (isLoading) return
    setErrorMsg('')
    const result = await removeFromCart(product._id)
    if (!result.success) {
      setErrorMsg(result.message)
    }
  }

  const itemTotal = (product.price || 0) * quantity

  return (
    <article className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm transition hover:shadow-md">
      <Link to={`/products/${product._id}`} className="shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full sm:w-28 sm:h-28 aspect-square object-cover rounded-xl border border-slate-100"
          loading="lazy"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-amber-700 uppercase">
              {product.category}
            </p>
            <h3 className="text-lg font-semibold text-slate-950 mt-1">
              <Link to={`/products/${product._id}`} className="hover:text-amber-800 transition">
                {product.name}
              </Link>
            </h3>
            <p className="text-sm font-medium text-slate-600 mt-1">
              {formatPrice(product.price)} each
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-lg font-bold text-slate-950">{formatPrice(itemTotal)}</p>
            {quantity > 1 && (
              <p className="text-xs text-slate-500">
                ({quantity} × {formatPrice(product.price)})
              </p>
            )}
          </div>
        </div>

        {errorMsg && <p className="text-xs text-red-600 mt-2">{errorMsg}</p>}

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 p-1">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={isMinQuantity || isLoading}
                aria-label="Decrease quantity"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
              >
                -
              </button>
              <span className="w-10 text-center font-semibold text-slate-900 text-sm">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={isMaxQuantity || isLoading}
                aria-label="Increase quantity"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
              >
                +
              </button>
            </div>
            {isMaxQuantity && (
              <span className="text-xs text-amber-700 font-medium">Max stock</span>
            )}
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isLoading}
            className="text-sm font-semibold text-red-600 hover:text-red-800 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </article>
  )
}
