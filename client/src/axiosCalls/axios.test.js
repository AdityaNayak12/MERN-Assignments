import assert from 'node:assert/strict'
import test from 'node:test'
import { axiosInstance, registerCustomer } from './axios.js'

test('registerCustomer posts registration values to the user register endpoint', async () => {
  const originalPost = axiosInstance.post
  let request

  axiosInstance.post = async (url, data) => {
    request = { url, data }
    return { status: 201 }
  }

  const values = {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '5551234567',
    password: 'secret123',
  }

  await registerCustomer(values)
  axiosInstance.post = originalPost

  assert.deepEqual(request, { url: '/user/register', data: values })
})
