import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-between rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-900/10 sm:p-12">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-300 uppercase">ShopKart</p>
          <div className="mt-20 max-w-2xl sm:mt-28">
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">A better way to browse</p>
            <h1 className="mt-4 text-5xl leading-tight font-semibold tracking-tight sm:text-7xl">Good things, thoughtfully found.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Explore a focused collection of products and find something that fits your everyday.</p>
            <Link className="mt-10 inline-flex rounded-xl bg-amber-300 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300" to="/products">
              Explore products →
            </Link>
          </div>
        </div>
        <p className="mt-20 text-sm text-slate-500">Great products. Simple shopping.</p>
      </div>
    </main>
  )
}
