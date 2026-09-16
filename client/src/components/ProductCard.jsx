import { Link } from 'react-router-dom'
import { formatPrice, getStockLabel } from '../services/productApi.js'

function ProductCard({ product }) {
  const isInStock = product.stock > 0

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
            <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">{product.category}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{product.name}</h2>
          </div>
          <p className="shrink-0 text-lg font-bold text-slate-950">{formatPrice(product.price)}</p>
        </div>
        <p className={`mt-4 text-sm font-semibold ${isInStock ? 'text-emerald-700' : 'text-slate-500'}`}>
          {getStockLabel(product.stock)}
        </p>
        <Link
          className="mt-auto pt-6 text-sm font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
          to={`/products/${product._id}`}
        >
          View details
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
