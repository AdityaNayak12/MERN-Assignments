import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice, getProduct, getStockLabel } from '../services/productApi.js'

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    getProduct(id)
      .then((nextProduct) => {
        if (!isCurrent) return
        setProduct(nextProduct)
      })
      .catch(() => {
        if (!isCurrent) return
        setError('Something went wrong while loading products.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id])

  if (isLoading) {
    return <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900 sm:px-8" aria-busy="true"><p className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading products...</p></main>
  }

  if (error || !product) {
    return <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900 sm:px-8"><p className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800" role="alert">Something went wrong while loading products.</p></main>
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
            <p className={`mt-6 text-sm font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>{getStockLabel(product.stock)}</p>
            <button className="mt-auto rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" type="button">
              Add to cart
            </button>
          </div>
        </article>
      </div>
    </main>
  )
}

export default ProductDetails
