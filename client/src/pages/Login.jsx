function Login({ onNavigate }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-8 text-slate-900">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-900/10 sm:p-10">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-300 font-black text-slate-950">C</div>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase">Sign in</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Your account is ready.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">Login is the next step for this customer flow.</p>
        <button
          className="mt-8 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          onClick={() => onNavigate('/register')}
          type="button"
        >
          Back to registration
        </button>
      </section>
    </main>
  )
}

export default Login
