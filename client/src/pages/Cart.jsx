import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import CartItem from '../components/CartItem.jsx'
import { formatPrice } from '../services/productApi.js'

export default function Cart() {
  const { cartItems, isLoading, error, cartCount, subtotal, fetchCart } = useCart()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 text-slate-900" aria-busy="true">
        <div className="mx-auto max-w-4xl text-center">
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-lg text-slate-600 shadow-sm">
            Loading your cart...
          </p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <p className="text-lg font-medium text-red-800 mb-4">{error || 'Unable to load your cart.'}</p>
            <button
              onClick={fetchCart}
              className="rounded-xl bg-amber-300 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-4 py-20 text-slate-900">
        <div className="mx-auto max-w-md text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-semibold mb-3 text-slate-950">Your cart is empty</h1>
          <p className="text-base text-slate-600 mb-8">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/products"
            className="inline-block rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 mb-8">
          <Link
            to="/products"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition mb-2 inline-block"
          >
            ← Continue shopping
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            My Cart
          </h1>
          <p className="text-slate-600 text-sm">
            You have {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <section className="lg:col-span-2 space-y-4" aria-label="Cart items">
            {cartItems.map((item) => (
              <CartItem
                key={(item.product?._id || item.product).toString()}
                item={item}
              />
            ))}
          </section>

          {/* Order Summary */}
          <aside className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-slate-950 mb-6">Order Summary</h2>

            <div className="space-y-4 text-sm text-slate-600 border-b border-slate-200 pb-6">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="font-semibold text-slate-900">{cartCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Distinct Products</span>
                <span className="font-semibold text-slate-900">{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-6 mb-6">
              <span className="text-base font-semibold text-slate-900">Subtotal</span>
              <span className="text-2xl font-bold text-slate-950">
                {formatPrice(subtotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => alert('Proceeding to checkout in Lab 06!')}
              className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Proceed to Checkout
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              Taxes calculated at next step. Secure checkout.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
