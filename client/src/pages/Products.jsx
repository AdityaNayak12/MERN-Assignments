import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import {
  getProducts,
  getProductsState,
} from '../services/productApi.js'

const emptyFilters = { search: '', category: '' }

function Products() {
  const [filters, setFilters] = useState(emptyFilters)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    getProducts(filters)
      .then((nextProducts) => {
        if (!isCurrent) return
        setProducts(nextProducts)
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
  }, [filters])

  const state = getProductsState({ isLoading, error, products })

  const handleChange = (event) => {
    const { name, value } = event.target
    setDraftFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    setFilters({ ...draftFilters })
  }

  const handleClear = () => {
    setDraftFilters(emptyFilters)
    if (filters.search === '' && filters.category === '') return
    setError('')
    setIsLoading(true)
    setFilters(emptyFilters)
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10" aria-busy={isLoading}>
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link className="text-sm font-semibold text-amber-700 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600" to="/home">
              ← Back to home
            </Link>
            <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase">The ShopKart edit</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Find your next favorite.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">A considered collection of useful things, ready when you are.</p>
          </div>
        </header>

        <form className="mt-10 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="search">Search products</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
              id="search"
              name="search"
              onChange={handleChange}
              placeholder="Try keyboard or lamp"
              type="search"
              value={draftFilters.search}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="category">Category</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
              id="category"
              name="category"
              onChange={handleChange}
              placeholder="e.g. Accessories"
              type="text"
              value={draftFilters.category}
            />
          </div>
          <button className="rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" type="submit">
            Apply filters
          </button>
          <button className="rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" onClick={handleClear} type="button">
            Clear
          </button>
        </form>

        <section className="mt-10" aria-live="polite" aria-label="Product results">
          {state === 'loading' && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading products...</p>}
          {state === 'error' && <p className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800" role="alert">Something went wrong while loading products.</p>}
          {state === 'empty' && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">No products found.</p>}
          {state === 'ready' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Products
