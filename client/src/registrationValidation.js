export function getRegistrationErrors(values) {
  const errors = {}

  if (!values.fullName?.trim()) errors.fullName = 'Full name is required.'
  if (!values.email?.trim()) {
    errors.email = 'Email address is required.'
  } else if (!values.email.includes('@')) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.phone?.trim()) errors.phone = 'Phone number is required.'
  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length <= 6) {
    errors.password = 'Password must be greater than 6 characters.'
  }

  return errors
}
