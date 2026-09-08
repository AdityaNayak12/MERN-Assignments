import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'

const initialValues = {
  email: '',
  password: '',
}

function Login() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await axiosInstance.post('/user/login', values)
      navigate('/home')
    } catch (requestError) {
      console.error(requestError.response?.data?.message ?? requestError.message)
      setError('Invalid Credentials')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-900/10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col justify-between bg-slate-950 p-7 text-white sm:p-10 lg:p-12">
          <div>
            <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-amber-300 uppercase">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-300 text-sm font-black text-slate-950">C</span>
              Compass
            </div>
            <div className="mt-20 max-w-sm lg:mt-28">
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">Welcome back</p>
              <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                Keep moving with clarity.
              </h1>
              <p className="mt-6 text-base leading-7 text-slate-300">
                Sign in to return to your focused space and pick up where you left off.
              </p>
            </div>
          </div>
          <p className="mt-16 text-sm text-slate-500">Simple tools. Steady progress.</p>
        </section>

        <section className="p-7 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold tracking-wide text-amber-700 uppercase">Sign in</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Welcome back.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Enter your details to continue.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-800" htmlFor="email">
                  Email address
                </label>
                <input
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={values.email}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800" htmlFor="password">
                  Password
                </label>
                <input
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  type="password"
                  value={values.password}
                />
              </div>

              {error && (
                <p aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">
                  {error}
                </p>
              )}

              <button
                className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                type="submit"
              >
                Login
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              Need an account?{' '}
              <Link
                className="font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                to="/register"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
