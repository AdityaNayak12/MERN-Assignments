import { useEffect, useReducer, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  formatPrice,
  getProduct,
  getStockLabel,
  productDetailsInitialState,
  productDetailsReducer,
} from '../services/productApi.js'
import { useCart } from '../context/CartContext.jsx'

function ProductDetails() {
  const { id } = useParams()
  const [{ product, isLoading, error }, dispatch] = useReducer(
    productDetailsReducer,
    productDetailsInitialState,
  )
  const { addToCart, updateQuantity, removeFromCart, getItemQuantity, isItemLoading } = useCart()
  const [cartError, setCartError] = useState('')

  useEffect(() => {
    dispatch({ type: 'loading' })
    let isCurrent = true

    getProduct(id)
      .then((nextProduct) => {
        if (!isCurrent) return
        dispatch({ type: 'success', product: nextProduct })
      })
      .catch(() => {
        if (!isCurrent) return
        dispatch({ type: 'error', error: 'Something went wrong while loading products.' })
      })

    return () => {
      isCurrent = false
    }
  }, [id])

  const quantityInCart = product ? getItemQuantity(product._id) : 0
  const isInStock = product && product.stock > 0
  const isMaxStockReached = product && quantityInCart >= product.stock
  const isAdding = product ? isItemLoading(product._id) : false

  const handleAddToCart = async () => {
    if (!product || isAdding || !isInStock || isMaxStockReached) return
    setCartError('')
    const result = await addToCart(product._id)
    if (!result.success) {
      setCartError(result.message)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900 sm:px-8" aria-busy="true">
        <p className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Loading products...
        </p>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900 sm:px-8">
        <p className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800" role="alert">
          Something went wrong while loading products.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-semibold text-amber-700 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600" to="/products">
          ← Back to products
        </Link>
        <article className="mt-8 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
          <img alt={product.name} className="h-full min-h-72 w-full object-cover md:min-h-[34rem]" src={product.image} />
          <div className="flex flex-col p-6 sm:p-10">
            <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase">{product.category}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{product.name}</h1>
            <p className="mt-5 text-2xl font-bold text-slate-950">{formatPrice(product.price)}</p>
            <p className="mt-6 text-base leading-7 text-slate-600">{product.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <p className={`text-sm font-semibold ${isInStock ? 'text-emerald-700' : 'text-slate-500'}`}>
                {getStockLabel(product.stock)}
              </p>
              {quantityInCart > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  In Cart ({quantityInCart})
                </span>
              )}
            </div>

            {cartError && <p className="mt-3 text-xs text-red-600">{cartError}</p>}

            {quantityInCart > 0 ? (
              <div className="mt-8 flex items-center justify-between w-full sm:w-auto rounded-xl border border-slate-300 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    setCartError('');
                    if (isAdding) return;
                    if (quantityInCart <= 1) {
                      const res = await removeFromCart(product._id);
                      if (!res.success) setCartError(res.message);
                    } else {
                      const res = await updateQuantity(product._id, quantityInCart - 1);
                      if (!res.success) setCartError(res.message);
                    }
                  }}
                  disabled={isAdding}
                  aria-label="Decrease quantity"
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
                >
                  -
                </button>
                <span className="font-semibold text-slate-900 text-base px-6">
                  {quantityInCart} in Cart
                </span>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    setCartError('');
                    if (isAdding || isMaxStockReached) return;
                    const res = await updateQuantity(product._id, quantityInCart + 1);
                    if (!res.success) setCartError(res.message);
                  }}
                  disabled={isMaxStockReached || isAdding}
                  aria-label="Increase quantity"
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !isInStock || isMaxStockReached}
                className="mt-8 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                type="button"
              >
                {isAdding
                  ? 'Adding...'
                  : !isInStock
                  ? 'Out of stock'
                  : 'Add to cart'}
              </button>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}

export default ProductDetails
