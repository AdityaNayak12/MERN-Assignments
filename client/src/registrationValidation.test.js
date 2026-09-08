import assert from 'node:assert/strict'
import test from 'node:test'
import { getRegistrationErrors } from './registrationValidation.js'

test('reports missing registration fields', () => {
  assert.deepEqual(getRegistrationErrors({}), {
    fullName: 'Full name is required.',
    email: 'Email address is required.',
    phone: 'Phone number is required.',
    password: 'Password is required.',
  })
})

test('requires a password longer than six characters', () => {
  assert.deepEqual(
    getRegistrationErrors({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '5551234567',
      password: 'secret',
    }),
    { password: 'Password must be greater than 6 characters.' },
  )
})

test('accepts complete registration details', () => {
  assert.deepEqual(
    getRegistrationErrors({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '5551234567',
      password: 'secret123',
    }),
    {},
  )
})
