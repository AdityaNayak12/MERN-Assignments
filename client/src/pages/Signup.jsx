import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'
import { getRegistrationErrors } from '../registrationValidation.js'

const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
}

function Signup() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = getRegistrationErrors(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    setApiError('')

    try {
      await axiosInstance.post('/user/register', values)
      navigate('/login')
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          'We could not create your account. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto grid w-full min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-900/10 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="flex flex-col justify-between bg-slate-950 p-7 text-white sm:p-10 lg:p-12">
          <div>
            <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-amber-300 uppercase">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-300 text-sm font-black text-slate-950">C</span>
              Compass
            </div>
            <div className="mt-20 max-w-sm lg:mt-28">
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">Start with clarity</p>
              <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                Make room for what matters.
              </h1>
              <p className="mt-6 text-base leading-7 text-slate-300">
                Create your account and keep your next steps in one calm, focused place.
              </p>
            </div>
          </div>
          <p className="mt-16 text-sm text-slate-500">Simple tools. Steady progress.</p>
        </section>

        <section className="p-7 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-wide text-amber-700 uppercase">Create account</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Welcome in.</h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">Use your details below to get started.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <FormField
                autoComplete="name"
                error={errors.fullName}
                id="fullName"
                label="Full name"
                onChange={handleChange}
                value={values.fullName}
              />
              <FormField
                autoComplete="email"
                error={errors.email}
                id="email"
                label="Email address"
                onChange={handleChange}
                type="email"
                value={values.email}
              />
              <FormField
                autoComplete="tel"
                error={errors.phone}
                id="phone"
                label="Phone number"
                onChange={handleChange}
                type="tel"
                value={values.phone}
              />
              <FormField
                autoComplete="new-password"
                error={errors.password}
                id="password"
                label="Password"
                onChange={handleChange}
                type="password"
                value={values.password}
              />

              {apiError && (
                <p aria-live="assertive" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">
                  {apiError}
                </p>
              )}

              <button
                aria-busy={isSubmitting}
                className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                className="font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function FormField({ autoComplete, error, id, label, onChange, placeholder, type = 'text', value }) {
  const errorId = `${id}-error`

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-amber-600 focus:ring-amber-100'}`}
        id={id}
        name={id}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={id === 'password' ? 7 : undefined}
        type={type}
        value={value}
      />
      {error && (
        <p className="mt-2 text-sm text-red-700" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Signup
