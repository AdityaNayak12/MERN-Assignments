import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, getStockLabel } from '../services/productApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { axiosInstance } from '../axiosCalls/axios.js'

function ProductCard({ product }) {
  const isInStock = product.stock > 0
  const { user, checkAuth } = useAuth()
  const { addToCart, updateQuantity, removeFromCart, getItemQuantity, isItemLoading } = useCart()
  
  const isSavedInitially = user?.wishlist?.includes(product._id)
  const [isSaved, setIsSaved] = useState(isSavedInitially)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [wishlistError, setWishlistError] = useState(null)
  const [cartError, setCartError] = useState('')

  const quantityInCart = getItemQuantity(product._id)
  const isInCart = quantityInCart > 0
  const isMaxStockReached = quantityInCart >= product.stock
  const isAddingToCart = isItemLoading(product._id)

  const toggleWishlist = async (e) => {
    e.preventDefault()
    if (isWishlistLoading) return

    setIsWishlistLoading(true)
    setWishlistError(null)
    try {
      const res = await axiosInstance.patch(`/wishlist/${product._id}/toggle`)
      setIsSaved(res.data.saved)
      checkAuth()
    } catch {
      setWishlistError('Failed to save')
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (isAddingToCart || !isInStock || isMaxStockReached) return

    setCartError('')
    const result = await addToCart(product._id)
    if (!result.success) {
      setCartError(result.message)
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <img
        alt={product.name}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
        src={product.image}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
              {product.category}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {product.name}
            </h2>
          </div>
          <p className="shrink-0 text-lg font-bold text-slate-950">{formatPrice(product.price)}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className={`text-sm font-semibold ${isInStock ? 'text-emerald-700' : 'text-slate-500'}`}>
            {getStockLabel(product.stock)}
          </p>
          {isInCart && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              In Cart ({quantityInCart})
            </span>
          )}
        </div>

        {wishlistError && <p className="mt-2 text-xs text-red-600">{wishlistError}</p>}
        {cartError && <p className="mt-2 text-xs text-red-600">{cartError}</p>}

        {isInCart ? (
          <div className="mt-5 flex items-center justify-between w-full rounded-xl border border-slate-300 bg-slate-50 p-1">
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                setCartError('');
                if (isAddingToCart) return;
                if (quantityInCart <= 1) {
                  const res = await removeFromCart(product._id);
                  if (!res.success) setCartError(res.message);
                } else {
                  const res = await updateQuantity(product._id, quantityInCart - 1);
                  if (!res.success) setCartError(res.message);
                }
              }}
              disabled={isAddingToCart}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              -
            </button>
            <span className="font-semibold text-slate-900 text-sm">
              {quantityInCart} in Cart
            </span>
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                setCartError('');
                if (isAddingToCart || isMaxStockReached) return;
                const res = await updateQuantity(product._id, quantityInCart + 1);
                if (!res.success) setCartError(res.message);
              }}
              disabled={isMaxStockReached || isAddingToCart}
              aria-label="Increase quantity"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !isInStock || isMaxStockReached}
            className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAddingToCart
              ? 'Adding...'
              : !isInStock
              ? 'Out of stock'
              : 'Add to Cart'}
          </button>
        )}

        <div className="mt-auto pt-4 flex justify-between items-center">
          <Link
            className="text-sm font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
            to={`/products/${product._id}`}
          >
            View details
          </Link>
          <button
            onClick={toggleWishlist}
            disabled={isWishlistLoading}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            {isWishlistLoading ? '⏳ Saving...' : isSaved ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
